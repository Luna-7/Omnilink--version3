import { NextResponse } from 'next/server'
import { createMerchantProduct } from '@/lib/product/service'
import { runSemanticPipeline } from '@/lib/product/semantic-pipeline'
import { supabase } from '@/lib/supabase/client'

// GET /api/merchant/products - List merchant products
export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      products: products || [],
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    )
  }
}

// POST /api/merchant/products - Create merchant product with semantic extraction
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        {
          error: 'title, description, and category are required',
        },
        { status: 400 },
      )
    }

    // Create product
    const product = await createMerchantProduct({
      title: body.title,
      description: body.description,
      category: body.category,
      images: body.images || [],
    })

    // Run unified semantic pipeline
    const pipelineResult = await runSemanticPipeline({
      productId: product.id,
      title: body.title,
      description: body.description,
      category: body.category,
    })

    return NextResponse.json({
      product,
      semantic_data: pipelineResult.semanticData,
      ai_ready: true,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    )
  }
}
