import { supabase } from '@/lib/supabase/client'
import type { CreateMerchantProduct } from './types'

export async function createMerchantProduct(data: CreateMerchantProduct) {
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      name: data.title,
      description: data.description,
      category: data.category,
      images: data.images,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return product
}
