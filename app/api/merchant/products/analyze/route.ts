import { NextRequest, NextResponse } from 'next/server'
import { analyzeProduct } from '@/lib/product-ai/gemini-analyzer'

export const runtime = 'nodejs'

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const productName = (
      (formData.get('productName') as string) ||
      (formData.get('name') as string) ||
      ''
    ).trim()

    const rawFiles = formData.getAll('images[]') as File[]
    // Fallback if client sent 'images' or 'file'
    const fallbackFiles = formData.getAll('images') as File[]
    const files = (rawFiles.length > 0 ? rawFiles : fallbackFiles).filter(
      (f): f is File => f instanceof File && f.size > 0
    )

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: '最多允许上传 5 张图片。' },
        { status: 400 }
      )
    }

    for (const file of files) {
      if (file.name.length > 255) {
        return NextResponse.json(
          { error: `文件名过长：${file.name}` },
          { status: 400 }
        )
      }

      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `不支持的图片格式：${file.type || 'unknown'}，请上传 JPG、PNG 或 WebP。` },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `图片大小超过 10MB 限制：${file.name}` },
          { status: 400 }
        )
      }
    }

    if (files.length === 0 && !productName) {
      return NextResponse.json(
        { error: '请上传图片或填写商品名称。' },
        { status: 400 }
      )
    }

    console.log('[product.analyze] start', {
      imageCount: files.length,
      hasProductName: Boolean(productName),
    })

    const images = await Promise.all(
      files.map(async (file) => ({
        bytes: Buffer.from(await file.arrayBuffer()),
        mimeType: file.type || 'image/jpeg',
      }))
    )

    const draft = await analyzeProduct({
      productName: productName || undefined,
      images,
    })

    console.log('[product.analyze] success', {
      imageCount: images.length,
      attributeCount: draft.attributes?.length ?? 0,
      moduleCount: draft.suggestedModules?.length ?? 0,
    })

    return NextResponse.json(
      {
        success: true,
        draft,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[product.analyze] failed', {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : '商品 AI 分析失败。',
      },
      { status: 500 }
    )
  }
}
