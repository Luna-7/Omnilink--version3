"use server";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/products/service";

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const description = String(
    formData.get("description") || "",
  ).trim();

  const price = Number(formData.get("price") || 0);

  const inventory = Number(
    formData.get("inventory") || 0,
  );

  const currency = String(
    formData.get("currency") || "USD",
  );

  const sku = String(
    formData.get("sku") || "",
  ).trim();

  if (!name) {
    return {
      success: false,
      error: "Product name is required",
    };
  }

  if (!Number.isFinite(price) || price < 0) {
    return {
      success: false,
      error: "Invalid price",
    };
  }

  if (!Number.isInteger(inventory) || inventory < 0) {
    return {
      success: false,
      error: "Invalid inventory",
    };
  }

  try {
    await createProduct({
      name,
      description,
      price,
      inventory,
      currency,
      sku,
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create product",
    };
  }
}

export async function updateProductAction(
  productId: string,
  formData: FormData,
) {
  const name = String(formData.get("name") || "").trim();

  const description = String(
    formData.get("description") || "",
  ).trim();

  const price = Number(formData.get("price") || 0);

  const inventory = Number(
    formData.get("inventory") || 0,
  );

  const currency = String(
    formData.get("currency") || "USD",
  );

  const sku = String(
    formData.get("sku") || "",
  ).trim();

  if (!name) {
    return {
      success: false,
      error: "Product name is required",
    };
  }

  if (!Number.isFinite(price) || price < 0) {
    return {
      success: false,
      error: "Invalid price",
    };
  }

  if (!Number.isInteger(inventory) || inventory < 0) {
    return {
      success: false,
      error: "Invalid inventory",
    };
  }

  try {
    await updateProduct(productId, {
      name,
      description,
      price,
      inventory,
      currency,
      sku,
    });

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update product",
    };
  }
}

export async function deleteProductAction(
  productId: string,
) {
  try {
    await deleteProduct(productId);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete product",
    };
  }
}
