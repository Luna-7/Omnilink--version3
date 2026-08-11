import { createClientServer } from "@/lib/supabase/server";

export type ProductInput = {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  inventory?: number;
  sku?: string;
};

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
    .select("*")
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
    .select("*")
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
