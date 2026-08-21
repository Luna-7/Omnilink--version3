import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import sharp from 'sharp'

import { requireUser, ownsProduct } from '@/lib/api/auth'
import { withRetry } from '@/lib/network/retry-server'

export const runtime = 'nodejs'

const ORIGINAL_BUCKET = 'omnilink-media-originals'
const PUBLIC_BUCKET = 'omnilink-media-public'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function getExtension(contentType: string) {
  switch (contentType) {
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    default:
      return 'jpg'
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUser()
  if (!auth.ok) return auth.response

  const { supabase, user } = auth

  try {
    const formData = await request.formData()
    const productId = formData.get('product_id')
    const assetIdValue = formData.get('asset_id')
    const file = formData.get('file')

    if (typeof productId !== 'string' || !productId) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 },
      )
    }

    if (typeof assetIdValue !== 'string' || !assetIdValue) {
      return NextResponse.json(
        { error: 'asset_id is required' },
        { status: 400 },
      )
    }

    const assetId = assetIdValue

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'file is required' },
        { status: 400 },
      )
    }

    if (file.name.length > 180) {
      return NextResponse.json(
        { error: 'File name is too long' },
        { status: 400 },
      )
    }

    console.log('[media.upload] start', {
      productId,
      assetId,
      fileSize: file.size,
      fileType: file.type,
    })

    const ownership = await ownsProduct(supabase, user, productId)
    if (!ownership.owned) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    console.log('[media.upload] ownership-ok', {
      productId,
      assetId,
    })

    // Idempotency Check
    const { data: existingAsset, error: existingAssetError } =
      await supabase
        .from('product_assets')
        .select('*')
        .eq('id', assetId)
        .maybeSingle()

    if (existingAssetError) {
      console.error('[media.upload] idempotency-check-failed', {
        productId,
        assetId,
        error: existingAssetError.message,
      })
    }

    if (existingAsset) {
      if (existingAsset.product_id !== productId) {
        return NextResponse.json(
          {
            error: 'Asset ID already belongs to another product.',
          },
          { status: 409 },
        )
      }

      console.log('[media.upload] idempotent-hit', {
        productId,
        assetId,
      })

      return NextResponse.json(
        {
          success: true,
          asset: existingAsset,
          idempotent: true,
        },
        { status: 200 },
      )
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image type' },
        { status: 400 },
      )
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image must be between 1 byte and 10 MB' },
        { status: 400 },
      )
    }

    console.log('[media.upload] validated', {
      productId,
      assetId,
    })

    const inputBuffer = Buffer.from(await file.arrayBuffer())

    const fileHash = crypto
      .createHash('sha256')
      .update(inputBuffer)
      .digest('hex')

    console.log('[media.upload] hash-computed', {
      productId,
      assetId,
    })

    const imageMetadata = await sharp(inputBuffer).metadata()

    const extension = getExtension(file.type)

    const originalStorageKey =
      `${productId}/${assetId}/original.${extension}`

    const publicStorageKey =
      `${productId}/${assetId}/public.webp`

    // Upload Private Original with retry
    await withRetry(
      async () => {
        const { error: originalError } = await supabase.storage
          .from(ORIGINAL_BUCKET)
          .upload(originalStorageKey, inputBuffer, {
            contentType: file.type,
            upsert: true,
          })

        if (originalError) {
          throw new Error(originalError.message)
        }
      },
      {
        timeoutMs: 30_000,
        maxAttempts: 3,
        shouldRetry: () => true,
        onRetry: ({ attempt, maxAttempts, delayMs, reason }) => {
          console.warn('[media.upload] original-retry', {
            productId,
            assetId,
            attempt,
            maxAttempts,
            delayMs,
            reason,
          })
        },
      },
    )

    console.log('[media.upload] original-uploaded', {
      productId,
      assetId,
    })

    try {
      const publicBuffer = await sharp(inputBuffer)
        .rotate()
        .webp({ quality: 85 })
        .toBuffer()

      console.log('[media.upload] public-processed', {
        productId,
        assetId,
      })

      // Upload Public WebP with retry
      await withRetry(
        async () => {
          const { error: publicError } = await supabase.storage
            .from(PUBLIC_BUCKET)
            .upload(publicStorageKey, publicBuffer, {
              contentType: 'image/webp',
              upsert: true,
            })

          if (publicError) {
            throw new Error(publicError.message)
          }
        },
        {
          timeoutMs: 30_000,
          maxAttempts: 3,
          shouldRetry: () => true,
          onRetry: ({ attempt, maxAttempts, delayMs, reason }) => {
            console.warn('[media.upload] public-retry', {
              productId,
              assetId,
              attempt,
              maxAttempts,
              delayMs,
              reason,
            })
          },
        },
      )

      console.log('[media.upload] public-uploaded', {
        productId,
        assetId,
      })

      const { data: publicUrlData } = supabase.storage
        .from(PUBLIC_BUCKET)
        .getPublicUrl(publicStorageKey)

      const publicUrl = publicUrlData.publicUrl

      const metadata = {
        provenance: {
          source: 'merchant_upload',
          original_hash: fileHash,
          original_storage_key: originalStorageKey,
          capture: {
            camera_make: null,
            camera_model: null,
            lens_model: null,
            capture_time: null,
          },
          verification: {
            exif_present: Boolean(imageMetadata.exif),
            c2pa_verified: false,
            confidence: null,
          },
        },
        media: {
          source_mime_type: file.type,
          width: imageMetadata.width ?? null,
          height: imageMetadata.height ?? null,
          processing: {
            public_format: 'image/webp',
            metadata_stripped: true,
          },
        },
      }

      // DB Registration with upsert
      const { data: asset, error: assetError } = await supabase
        .from('product_assets')
        .upsert(
          {
            id: assetId,
            product_id: productId,
            asset_type: 'public',
            url: publicUrl,
            storage_key: publicStorageKey,
            file_hash: fileHash,
            size_bytes: file.size,
            metadata,
          },
          {
            onConflict: 'id',
          },
        )
        .select()
        .single()

      if (assetError) {
        throw new Error(assetError.message)
      }

      console.log('[media.upload] asset-registered', {
        productId,
        assetId,
      })

      return NextResponse.json(
        {
          success: true,
          asset,
        },
        { status: 201 },
      )
    } catch (error) {
      console.log('[media.upload] cleanup-start', {
        productId,
        assetId,
      })

      const cleanupResults = await Promise.allSettled([
        supabase.storage.from(ORIGINAL_BUCKET).remove([originalStorageKey]),
        supabase.storage.from(PUBLIC_BUCKET).remove([publicStorageKey]),
      ])

      const cleanupErrors = cleanupResults
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => r.reason)

      if (cleanupErrors.length > 0) {
        console.error('[media.upload] cleanup-error', {
          productId,
          assetId,
          errors: cleanupErrors.map((e) => (e instanceof Error ? e.message : String(e))),
        })
      } else {
        console.log('[media.upload] cleanup-complete', {
          productId,
          assetId,
        })
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Media processing failed'

      console.error('[media.upload] failed', {
        productId,
        assetId,
        error: errorMessage,
      })

      return NextResponse.json(
        {
          error: errorMessage,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error'

    console.error('[media.upload] unhandled-error', {
      error: errorMessage,
    })

    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}
