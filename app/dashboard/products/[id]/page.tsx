import { getDemoProductById, DEMO_PRODUCTS, type DemoProduct } from '@/lib/products/demo-data'
import { ProductDetailView } from '@/components/product/ProductDetailView'
import { createClientServer } from '@/lib/supabase/server'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 1. First check if it matches a predefined demo product
  let product: DemoProduct | undefined = DEMO_PRODUCTS.find(
    (p) => p.id === id || p.sku.toLowerCase() === id.toLowerCase()
  )

  // 2. If not found in demo, check database
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
          options: [
            {
              id: 'opt-default',
              name: '规格',
              name_en: 'Specification',
              code: 'spec',
              values: ['默认规格 (Standard)'],
            },
          ],
          variants: [
            {
              id: 'var-default',
              sku: dbProduct.sku || 'SKU-001',
              price: Number(dbProduct.price) || 0,
              inventory: Number(dbProduct.inventory) || 0,
              status: 'active',
              option_values: { spec: '默认规格 (Standard)' },
            },
          ],
          semantic_data: (dbProduct.semantic_data as any) || {
            brand: 'OmniBrand',
            category: dbProduct.category || 'General Products',
            confidence: 0.95,
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
          evidence: [],
          agent_qa: [
            {
              question: '这款商品有什么特点？',
              question_en: 'What are the features of this product?',
              answer: `${dbProduct.name} 属于 ${dbProduct.category || '通用分类'}，官方售价为 ¥${dbProduct.price}。`,
              answer_en: `${dbProduct.name} is in ${dbProduct.category || 'General'} at ¥${dbProduct.price}.`,
            },
          ],
        }
      }
    } catch {
      // ignore db error
    }
  }

  // 3. Fallback to default demo product if still not found
  if (!product) {
    product = getDemoProductById(id) || DEMO_PRODUCTS[0]
  }

  return <ProductDetailView product={product} />
}
