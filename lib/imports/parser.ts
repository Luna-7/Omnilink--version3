import * as XLSX from "xlsx";

export type ParsedRow = Record<string, unknown>;

export type ParsedSheet = {
  name: string;
  headers: string[];
  rows: ParsedRow[];
};

export function parseSpreadsheet(
  buffer: ArrayBuffer,
): ParsedSheet[] {
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
  });

  return workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<ParsedRow>(
      worksheet,
      {
        defval: null,
        raw: false,
      },
    );

    const headers = Array.from(
      new Set(
        rows.flatMap((row) =>
          Object.keys(row),
        ),
      ),
    );

    return {
      name: sheetName,
      headers,
      rows,
    };
  });
}

export type StableField =
  | "name"
  | "sku"
  | "price"
  | "currency"
  | "inventory"
  | "description";

const FIELD_ALIASES: Record<
  StableField,
  string[]
> = {
  name: [
    "name",
    "product name",
    "product_name",
    "title",
    "商品名称",
    "商品名",
    "产品名称",
    "产品名",
  ],

  sku: [
    "sku",
    "product sku",
    "商品sku",
    "货号",
    "产品编号",
    "编号",
  ],

  price: [
    "price",
    "sale price",
    "selling price",
    "售价",
    "价格",
    "销售价",
  ],

  currency: [
    "currency",
    "currency code",
    "货币",
    "币种",
  ],

  inventory: [
    "inventory",
    "stock",
    "quantity",
    "库存",
    "库存量",
    "数量",
  ],

  description: [
    "description",
    "product description",
    "描述",
    "商品描述",
    "产品描述",
  ],
};

function normalizeHeader(
  value: string,
) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

export function detectStableMapping(
  headers: string[],
) {
  const mapping: Partial<
    Record<StableField, string>
  > = {};

  for (const header of headers) {
    const normalized =
      normalizeHeader(header);

    for (const field of Object.keys(
      FIELD_ALIASES,
    ) as StableField[]) {
      const aliases =
        FIELD_ALIASES[field];

      const matched = aliases.some(
        (alias) =>
          normalizeHeader(alias) ===
          normalized,
      );

      if (matched && !mapping[field]) {
        mapping[field] = header;
      }
    }
  }

  return mapping;
}

export type ImportPreview = {
  fileName: string;
  totalRows: number;
  headers: string[];
  sampleRows: ParsedRow[];
  detectedMapping: Partial<Record<StableField, string>>;
  unknownFields: string[];
  warnings: string[];
};

export function generateImportPreview(
  fileName: string,
  sheet: ParsedSheet,
): ImportPreview {
  const detectedMapping = detectStableMapping(sheet.headers);
  const mappedFields = Object.values(detectedMapping);
  const unknownFields = sheet.headers.filter(
    (header) => !mappedFields.includes(header),
  );

  const warnings: string[] = [];

  if (!detectedMapping.name) {
    warnings.push("No product name field detected");
  }

  if (!detectedMapping.price) {
    warnings.push("No price field detected");
  }

  return {
    fileName,
    totalRows: sheet.rows.length,
    headers: sheet.headers,
    sampleRows: sheet.rows.slice(0, 10),
    detectedMapping,
    unknownFields,
    warnings,
  };
}
