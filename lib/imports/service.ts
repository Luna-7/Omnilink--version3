import { createClientServer } from "@/lib/supabase/server";
import {
  ParsedRow,
  StableField,
} from "./parser";
import { runSemanticPipeline } from "@/lib/product/semantic-pipeline";

function toNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const cleaned = value
      .replace(/[$€£¥,\s]/g, "")
      .trim();

    const number = Number(cleaned);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportResult {
  successRows: number;
  failedRows: number;
  errors: ValidationError[];
  mapping: Partial<Record<StableField, string>>;
}

export async function importProducts(
  rows: ParsedRow[],
  headers: string[],
  mapping: Partial<Record<StableField, string>>,
): Promise<ImportResult> {
  const supabase =
    await createClientServer();

  const {
    data: {
      user,
    },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Unauthorized",
    );
  }

  const {
    data: store,
    error: storeError,
  } = await supabase
    .from("stores")
    .select("id")
    .eq(
      "owner_id",
      user.id,
    )
    .maybeSingle();

  if (storeError) {
    throw new Error(
      storeError.message,
    );
  }

  if (!store) {
    throw new Error(
      "Store not found",
    );
  }

  const errors: ValidationError[] = [];
  const validProducts: Array<{
    store_id: string;
    name: string;
    sku: string | null;
    description: string | null;
    price: number;
    currency: string;
    inventory: number;
    status: string;
    raw_data: ParsedRow;
  }> = [];

  rows.forEach((row, rowIndex) => {
    const nameField = mapping.name;
    const priceField = mapping.price;
    const inventoryField = mapping.inventory;
    const skuField = mapping.sku;
    const currencyField = mapping.currency;
    const descriptionField = mapping.description;

    // Validation
    if (!nameField) {
      errors.push({
        row: rowIndex + 1,
        field: "name",
        message: "Name field not mapped",
      });
      return;
    }

    const name = String(row[nameField] ?? "").trim();
    if (!name) {
      errors.push({
        row: rowIndex + 1,
        field: "name",
        message: "Name is required",
      });
      return;
    }

    if (!priceField) {
      errors.push({
        row: rowIndex + 1,
        field: "price",
        message: "Price field not mapped",
      });
      return;
    }

    const price = toNumber(row[priceField]);
    if (price === null) {
      errors.push({
        row: rowIndex + 1,
        field: "price",
        message: "Invalid price",
      });
      return;
    }

    const inventory = inventoryField
      ? toNumber(row[inventoryField]) ?? 0
      : 0;

    if (inventory !== null && !Number.isInteger(inventory)) {
      errors.push({
        row: rowIndex + 1,
        field: "inventory",
        message: "Inventory must be an integer",
      });
      return;
    }

    validProducts.push({
      store_id: store.id,
      name,
      sku: skuField
        ? String(row[skuField] ?? "").trim() || null
        : null,
      description: descriptionField
        ? String(row[descriptionField] ?? "").trim() || null
        : null,
      price,
      currency: currencyField
        ? String(row[currencyField] ?? "USD")
        : "USD",
      inventory: inventory ?? 0,
      status: "active",
      raw_data: row,
    });
  });

  // Batch insert (100 at a time)
  const BATCH_SIZE = 100;
  let successCount = 0;
  const insertedProductIds: string[] = [];

  for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
    const batch = validProducts.slice(i, i + BATCH_SIZE);

    const { data: insertedProducts, error: insertError } = await supabase
      .from("products")
      .insert(batch)
      .select("id");

    if (insertError) {
      // Mark all rows in this batch as failed
      batch.forEach((_, batchIndex) => {
        errors.push({
          row: i + batchIndex + 1,
          field: "database",
          message: insertError.message,
        });
      });
    } else {
      successCount += batch.length;
      if (insertedProducts) {
        insertedProducts.forEach((product) => {
          insertedProductIds.push(product.id);
        });
      }
    }
  }

  // Trigger semantic processing for successfully inserted products
  // This should not fail the import if semantic processing fails
  if (insertedProductIds.length > 0) {
    for (const productId of insertedProductIds) {
      try {
        // Get product details for semantic pipeline
        const { data: product } = await supabase
          .from("products")
          .select("id, name, description")
          .eq("id", productId)
          .single()

        if (product) {
          await runSemanticPipeline({
            productId: product.id,
            title: product.name,
            description: product.description,
            category: undefined
          })
        }
      } catch (semanticError) {
        // Log semantic processing error but don't fail the import
        console.error(`Semantic processing failed for product ${productId}:`, semanticError);
      }
    }
  }

  return {
    successRows: successCount,
    failedRows: errors.length,
    errors,
    mapping,
  };
}
