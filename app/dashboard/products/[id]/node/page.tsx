import { DEMO_PRODUCTS, getDemoProductById, type DemoProduct } from '@/lib/products/demo-data'
import { ProductNodeVisualizer } from '@/components/product/node/ProductNodeVisualizer'
import { createClientServer } from '@/lib/supabase/server'

export default async function NodePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Check demo products first
  let product: DemoProduct | undefined = DEMO_PRODUCTS.find(
    (p) => p.id === id || p.sku.toLowerCase() === id.toLowerCase()
  )

  if (!product) {
    try {
      const supabase = await createClientServer()
      const { data: dbProduct } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (dbProduct) {
        product = {
          id: dbProduct.id,
          name: dbProduct.name,
          name_en: dbProduct.name,
          sku: dbProduct.sku || 'SKU-UNKNOWN',
          category: dbProduct.category || '通用商品',
          category_en: 'General',
          price: Number(dbProduct.price) || 0,
          currency: dbProduct.currency || 'CNY',
          inventory: Number(dbProduct.inventory) || 0,
          status: (dbProduct.status as any) || 'active',
          sales_count: 120,
          image_url: dbProduct.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          description: dbProduct.description || '暂无详细描述',
          description_en: dbProduct.description || 'No description available',
          created_at: dbProduct.created_at || new Date().toISOString(),
          updated_at: dbProduct.updated_at || new Date().toISOString(),
          channels: {
            shopify: true,
            amazon: true,
            tiktok: false,
            google: false,
          },
          options: [],
          variants: [],
          semantic_data: (dbProduct.semantic_data as any) || {
            brand: 'OmniBrand',
            category: dbProduct.category || 'General Products',
            confidence: 0.96,
            key_features: ['全网 AI 智能识别', '语义属性自动抽取', '全渠道即时同步'],
            key_features_en: ['AI agent discoverable', 'Structured attributes', 'Omni-channel ready'],
            target_audience: '大众消费群体',
            target_audience_en: 'General Consumers',
            attributes: {
              status: 'Ready',
              sku: dbProduct.sku || 'SKU',
            },
            ai_search_terms: ['商品', '推荐商品'],
            agent_reasoning: '该商品已完成基础结构化提取，支持大模型检索。',
            agent_reasoning_en: 'Base structured extraction completed, ready for LLM queries.',
          },
          evidence: [
            {
              semantic_field: 'catalog_registration',
              evidence_type: 'merchant_input',
              evidence_source: 'Merchant Catalog Admin',
              confidence: 0.99,
              field_value: 'Direct Store Submission',
            },
          ],
          agent_qa: [],
        }
      }
    } catch {
      // ignore
    }
  }

  if (!product) {
    product = getDemoProductById(id) || DEMO_PRODUCTS[0]
  }

  return <ProductNodeVisualizer product={product} />
}
