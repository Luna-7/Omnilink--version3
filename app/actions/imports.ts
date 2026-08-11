"use server";

import { parseSpreadsheet, generateImportPreview, ParsedSheet, StableField } from "@/lib/imports/parser";
import { importProducts } from "@/lib/imports/service";

export async function previewImportAction(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    return {
      success: false,
      error: "No file provided",
    };
  }

  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: "Invalid file type. Please upload .xlsx, .xls, or .csv",
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const sheets = parseSpreadsheet(arrayBuffer);

    if (!sheets.length) {
      return {
        success: false,
        error: "No sheets found in file",
      };
    }

    const firstSheet = sheets[0];

    if (!firstSheet.rows.length) {
      return {
        success: false,
        error: "No data found in file",
      };
    }

    const preview = generateImportPreview(file.name, firstSheet);

    return {
      success: true,
      data: {
        preview,
        sheet: firstSheet,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse file",
    };
  }
}

export async function confirmImportAction(
  sheet: ParsedSheet,
  mapping: Partial<Record<StableField, string>>,
) {
  try {
    const result = await importProducts(
      sheet.rows,
      sheet.headers,
      mapping,
    );

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to import products",
    };
  }
}
