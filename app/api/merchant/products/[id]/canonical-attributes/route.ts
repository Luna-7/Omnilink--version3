import {
  NextRequest,
  NextResponse,
} from 'next/server'

import {
  requireUser,
  ownsProduct,
} from '@/lib/api/auth'

import {
  getCanonicalProductAttributes,
  saveCanonicalProductAttributes,
} from '@/lib/products/canonical-attributes'

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  const { id } = await params

  const auth = await requireUser()

  if (!auth.ok) {
    return auth.response
  }

  const { owned } = await ownsProduct(
    auth.supabase,
    auth.user,
    id,
  )

  if (!owned) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 },
    )
  }

  try {
    const canonical =
      await getCanonicalProductAttributes(id)

    return NextResponse.json(canonical)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load canonical attributes',
      },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  },
) {
  const { id } = await params

  const auth = await requireUser()

  if (!auth.ok) {
    return auth.response
  }

  const { owned } = await ownsProduct(
    auth.supabase,
    auth.user,
    id,
  )

  if (!owned) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 },
    )
  }

  try {
    const body =
      await request.json()

    if (
      !body ||
      !Array.isArray(body.attributes)
    ) {
      return NextResponse.json(
        {
          error:
            'attributes must be an array',
        },
        { status: 400 },
      )
    }

    if (body.attributes.length > 100) {
      return NextResponse.json(
        {
          error:
            'Maximum 100 attributes allowed',
        },
        { status: 400 },
      )
    }

    const result =
      await saveCanonicalProductAttributes(
        id,
        {
          category:
            typeof body.category === 'string'
              ? body.category
              : undefined,
          attributes:
            body.attributes,
        },
      )

    return NextResponse.json({
      success: true,
      mapping: result.mapping,
      canonical: result.canonical,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to save canonical attributes',
      },
      { status: 500 },
    )
  }
}
