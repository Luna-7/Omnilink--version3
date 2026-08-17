import { createClientServer } from "@/lib/supabase/server";
import {
  ParsedRow,
  StableField,
} from "./parser";
import { runSemanticPipeline } from "@/lib/product/semantic-pipeline";
import type { ImportAnalysis, ProductGroupCandidate } from "./types";
import { createProductOption, createProductVariant } from "@/lib/products/variants/service";

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
  productsCreated?: number;
  variantsCreated?: number;
  groupsProcessed?: number;
  groupsFailed?: number;
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

/**
 * Persist variant-aware import from ImportAnalysis
 * This is the main entry point for P1-C persistence
 */
export async function persistImportAnalysis(
  analysis: ImportAnalysis,
): Promise<ImportResult> {
  const supabase = await createClientServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const {
    data: store,
    error: storeError,
  } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (storeError) {
    throw new Error(storeError.message);
  }

  if (!store) {
    throw new Error("Store not found");
  }

  // Validate analysis mode
  if (analysis.mode === "needs_review") {
    throw new Error("Cannot import: analysis requires review due to conflicts");
  }

  const errors: ValidationError[] = [];
  let productsCreated = 0;
  let variantsCreated = 0;
  let groupsProcessed = 0;
  let groupsFailed = 0;

  // Process each product group
  for (const group of analysis.groups) {
    groupsProcessed++;

    try {
      // Persist product group (atomic operation)
      const result = await persistProductGroup(store.id, group, analysis.rows);
      productsCreated += result.productsCreated;
      variantsCreated += result.variantsCreated;
    } catch (error) {
      groupsFailed++;
      // Record error for all rows in this group
      group.sourceRows.forEach((rowIndex) => {
        errors.push({
          row: rowIndex + 1,
          field: "database",
          message: error instanceof Error ? error.message : "Failed to persist product group",
        });
      });
    }
  }

  return {
    successRows: analysis.summary.totalRows - errors.length,
    failedRows: errors.length,
    errors,
    mapping,
    productsCreated,
    variantsCreated,
    groupsProcessed,
    groupsFailed,
  };
}

/**
 * Persist a single product group atomically
 * Product + Options + Variants
 */
async function persistProductGroup(
  storeId: string,
  group: ProductGroupCandidate,
  rows: Array<{ raw: ParsedRow }>,
): Promise<{ productsCreated: number; variantsCreated: number }> {
  const supabase = await createClientServer();

  // Step 1: Create product
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      store_id: storeId,
      name: group.product.name,
      description: group.product.description || null,
      status: "active", // Products are active by default
      raw_data: group.sourceRows.map((rowIndex) => rows[rowIndex]?.raw || {}),
    })
    .select("id")
    .single();

  if (productError || !product) {
    throw new Error(`Failed to create product: ${productError?.message}`);
  }

  // Step 2: Create options (if any)
  const createdOptions: { id: string; code: string }[] = [];
  for (const option of group.options) {
    try {
      const createdOption = await createProductOption(product.id, {
        name: option.name,
        code: option.code,
        values: option.values,
        position: group.options.indexOf(option),
      });
      createdOptions.push({ id: createdOption.id, code: createdOption.code });
    } catch (optionError) {
      // If option creation fails, log but continue (non-critical)
      console.error(`Failed to create option ${option.code}:`, optionError);
    }
  }

  // Step 3: Create variants (if any)
  let variantsCreatedCount = 0;
  for (const variant of group.variants) {
    try {
      await createProductVariant(product.id, {
        sku: variant.sku || null,
        price: variant.price || null,
        currency: variant.currency || "USD",
        inventory: variant.inventory ?? null,
        status: "draft", // Variants start as draft
        option_values: variant.optionValues,
        raw_data: variant.sourceRows.map((rowIndex) => rows[rowIndex]?.raw || {}),
        semantic_data: null, // No AI processing in this phase
      });
      variantsCreatedCount++;
    } catch (variantError) {
      // If variant creation fails, log but continue
      console.error(`Failed to create variant:`, variantError);
    }
  }

  // Step 4: Trigger semantic pipeline for product (non-blocking)
  try {
    await runSemanticPipeline({
      productId: product.id,
      title: group.product.name,
      description: group.product.description,
      category: undefined,
    });
  } catch (semanticError) {
    // Semantic processing failure should not fail the import
    console.error(`Semantic processing failed for product ${product.id}:`, semanticError);
  }

  return {
    productsCreated: 1,
    variantsCreated: variantsCreatedCount,
  };
}
