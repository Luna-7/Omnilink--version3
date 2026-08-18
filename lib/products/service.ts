import { createClientServer } from "@/lib/supabase/server";

// Merchant-owned product reads: explicit whitelist (Demo #56). Includes
// sku/inventory/raw_data because the merchant dashboard semantic page needs
// them; this is merchant-private, not a public endpoint.
const MERCHANT_PRODUCT_SELECT =
  "id, store_id, sku, name, description, price, currency, inventory, status, raw_data, semantic_data, created_at, updated_at";

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  inventory?: number;
  sku?: string;
  /** Optional pre-computed semantic data (e.g. from a future AI pipeline). */
  semantic_data?: Record<string, unknown> | null;
};

/**
 * Demo semantic fallback (#57 P4): the Demo has no AI extraction pipeline, so
 * a freshly created product gets a minimal valid semantic_data instead of null.
 * This is explicitly a Demo fallback — NOT real semantic-engine output — and
 * exists only so the public ai-json / agent query have structured data to
 * return. Source of Truth for semantics in the Demo remains products.semantic_data.
 */
function buildDemoSemanticFallback(): Record<string, unknown> {
  return { category: null, attributes: {}, confidence: 1 };
}

async function getAuthenticatedUser() {
  const supabase = await createClientServer();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return { supabase, user };
}

async function getOwnedStore() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: store, error } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!store) {
    throw new Error("Store not found");
  }

  return {
    supabase,
    user,
    store,
  };
}

export async function getProductsByStore() {
  const { supabase, store } = await getOwnedStore();

  const { data, error } = await supabase
    .from("products")
    .select(MERCHANT_PRODUCT_SELECT)
    .eq("store_id", store.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getProductById(productId: string) {
  const { supabase, store } = await getOwnedStore();

  const { data, error } = await supabase
    .from("products")
    .select(MERCHANT_PRODUCT_SELECT)
    .eq("id", productId)
    .eq("store_id", store.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createProduct(input: ProductInput) {
  const { supabase, store } = await getOwnedStore();

  const semantic_data =
    input.semantic_data && typeof input.semantic_data === "object"
      ? input.semantic_data
      : buildDemoSemanticFallback();

  const { data, error } = await supabase
    .from("products")
    .insert({
      store_id: store.id,
      sku: input.sku || null,
      name: input.name,
      description: input.description || null,
      price: input.price,
      currency: input.currency || "USD",
      inventory: input.inventory ?? 0,
      status: "active",
      semantic_data,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProduct(
  productId: string,
  input: ProductInput,
) {
  const { supabase, store } = await getOwnedStore();

  const { data, error } = await supabase
    .from("products")
    .update({
      sku: input.sku || null,
      name: input.name,
      description: input.description || null,
      price: input.price,
      currency: input.currency || "USD",
      inventory: input.inventory ?? 0,
    })
    .eq("id", productId)
    .eq("store_id", store.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteProduct(productId: string) {
  const { supabase, store } = await getOwnedStore();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", store.id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}
