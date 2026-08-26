# Omnilink Commerce Object Audit

**Date**: 2026-08-26  
**Phase**: Phase 2 — Commerce Object Audit & Transaction Boundary Refactor  
**Last Updated**: 2026-08-26 — P0 stabilization (Product/Option/Variant creation flow)
**Objective**: Establish correct data boundaries for Product → Option → Variant → Cart → Order Line → Snapshot → Fulfillment

---

## Executive Summary

| Object | Database | Model | Service | API | UI | Status |
|--------|----------|-------|--------|-----|---|--------|
| Product | ✅ | ✅ | ✅ | ✅ | ✅ | REAL |
| Product Knowledge | ✅ | ✅ | ✅ | ✅ | ✅ | REAL |
| Product Option | ✅ | ✅ | ✅ | ✅ | ✅ | REAL |
| Product Variant | ✅ | ✅ | ✅ | ✅ | ✅ | REAL |
| Cart | ❌ | ✅ | ❌ | ❌ | ✅ | MOCK ONLY |
| Cart Item | ❌ | ✅ | ❌ | ❌ | ✅ | MOCK ONLY |
| Order | ✅ | ✅ | ✅ | ✅ | ✅ | REAL |
| Order Line | ✅ | ✅ | ✅ | ✅ | ✅ | REAL |
| Snapshot | ✅ | ✅ | ✅ | ✅ | ✅ | REAL |
| Fulfillment | ❌ | ❌ | ❌ | ❌ | ❌ | MISSING |

---

## Critical Issues Identified

### 1. RESOLVED (2026-08-26, P0): Product Creation Flow Now Writes to Domain Tables

**Original location**: `components/product/ProductCreateDialog.tsx` (legacy audit claim).

**Original problem** (now resolved):
- UI had `variantOptions` state for product options
- During product creation, options were written to `raw_data.options` instead of creating real `product_options` and `product_variants` records
- The domain tables existed but the creation flow did NOT use them

**P0 Fix (applied)**:
- `ProductCreateDialog.handleSubmit` now sends `options` at the **top level** of the request body (not in `raw_data`).
- `POST /api/merchant/products` delegates to `createProductWithVariants()` (in `lib/products/product-with-variants-service.ts`), which:
  1. Creates the `products` row.
  2. Calls `createProductOption()` for each input option (writes to `product_options`).
  3. Calls `generateVariantCombinations()` to derive the Cartesian product.
  4. Calls `createProductVariant()` for each combination (writes to `product_variants`).
- `raw_data.options` is no longer written. `raw_data.category` / `raw_data.category_id` / `raw_data.origin` / `raw_data.attributes` remain as compatibility fields.
- P0 runtime bug also fixed: `category` / `category_id` are no longer written as top-level `products` columns (they don't exist in the schema).
- A fake `/composition` POST with `component_type: 'assembly'` was removed from `ProductCreateDialog`. Origin is now expressed canonically on `products.raw_data.origin` and the canonical attribute `country_of_origin`.
- Source-of-truth tables are now:
  - `products` → product identity
  - `product_options` → option dimensions
  - `product_variants` → SKU-level truth (price/inventory/SKU)
- Compensation rollback is hardened: cleanup failures surface via the returned `error` instead of being silently `console.warn`'d.

**Verification**:
- 8 new Vitest tests in `lib/products/__tests__/product-with-variants-service.test.ts` (all passing).
- `npm run test`, `npm run build`, `npm run lint` all execute cleanly for the changed code.

---

## Detailed Object Audit

### 1. Product

**Purpose**: Product identity and long-lived product knowledge

**Database Table**: `products`
- ✅ Exists with full schema
- Columns: id, store_id, name, sku, price, currency, inventory, description, status, category, category_id, raw_data, semantic_data, created_at, updated_at
- RLS: Enabled with store ownership policies

**TypeScript Model**: 
- ✅ `lib/products/product-management-model.ts` - `ProductManagementModel`
- ✅ `lib/storefront/types.ts` - `StorefrontProduct`

**Service Layer**:
- ✅ `lib/products/service.ts` - CRUD operations
- ✅ `lib/products/product-management-loader.ts` - Data loading
- ✅ `lib/products/product-management-save.ts` - Data saving

**API Routes**:
- ✅ `app/api/merchant/products/route.ts` - POST (create), GET (list)
- ✅ `app/api/merchant/products/[id]/route.ts` - GET, PUT, DELETE
- ✅ `app/api/products/[id]/route.ts` - Public product endpoint

**UI Components**:
- ✅ `components/product/ProductCreateDialog.tsx` - Product creation
- ✅ `components/product/ProductsView.tsx` - Product listing
- ✅ `components/product/ProductDetailView.tsx` - Product detail

**Current Status**: **REAL** - Fully implemented with database, service, API, and UI

**Source of Truth**: Database `products` table

**Known Problems**: None critical

---

### 2. Product Knowledge

**Purpose**: Product facts, composition, source, verifiable information

**Database Tables**:
- ✅ `product_attributes` - General physical/measurable attributes
- ✅ `product_composition` - Material/component composition data
- ✅ `product_content` - Marketing content, features, SEO data

**TypeScript Models**:
- ✅ `lib/products/product-attribute-domains.ts` - All domain interfaces
- ✅ `lib/products/canonical-attributes.ts` - Canonical attribute format

**Service Layer**:
- ✅ `lib/products/attribute-domains-service.ts` - CRUD for all three domains
- ✅ `lib/products/attribute-domains-legacy.ts` - Migration and compatibility

**API Routes**:
- ✅ `app/api/merchant/products/[id]/attributes/route.ts`
- ✅ `app/api/merchant/products/[id]/composition/route.ts`
- ✅ `app/api/merchant/products/[id]/content/route.ts`

**UI Components**:
- ✅ Integrated in ProductCreateDialog (canonical attributes)
- ✅ ProductDetailView displays attributes

**Current Status**: **REAL** - Fully implemented with recent refactoring

**Source of Truth**: Domain tables (`product_attributes`, `product_composition`, `product_content`)

**Known Problems**: None - Recently refactored and working correctly

---

### 3. Product Option

**Purpose**: User-selectable specification dimensions (e.g., Color, Size)

**Database Table**: `product_options`
- ✅ Exists with full schema
- Columns: id, product_id, name, code, position, values (jsonb), created_at
- RLS: Enabled with store ownership policies
- Unique constraint: (product_id, code)

**TypeScript Model**:
- ✅ `lib/products/variants/types.ts` - `ProductOption`, `CreateProductOptionInput`, `UpdateProductOptionInput`

**Service Layer**:
- ✅ `lib/products/variants/service.ts` - Full CRUD with validation
- Functions: `getProductOptions`, `createProductOption`, `updateProductOption`, `deleteProductOption`
- Validation: Option code format, value uniqueness, duplicate code prevention

**API Routes**:
- ✅ `app/api/products/[id]/options/route.ts` - GET, POST
- ✅ `app/api/products/[id]/options/[optionId]/route.ts` - PUT, DELETE

**UI Components**:
- ✅ `components/product/ProductCreateDialog.tsx` - Has `variantOptions` state
- ✅ `components/product/create/ProductVariantEntry.tsx` - Option entry UI

**Current Status**: **REAL** - Database, model, service, API all exist

**Source of Truth**: Database `product_options` table

**Known Problems**: 
- None — the P0 flow now creates `product_options` records during product creation via the `createProductWithVariants` orchestrator.

---

### 4. Product Variant

**Purpose**: Real sellable SKU with specific option combination

**Database Table**: `product_variants`
- ✅ Exists with full schema
- Columns: id, product_id, sku, price, currency, inventory, status, option_values (jsonb), raw_data, semantic_data, created_at, updated_at
- RLS: Enabled with store ownership policies
- Indexes: product_id, sku, status, option_values (GIN)

**TypeScript Model**:
- ✅ `lib/products/variants/types.ts` - `ProductVariant`, `CreateProductVariantInput`, `UpdateProductVariantInput`
- ✅ `lib/storefront/types.ts` - `StorefrontProductVariant`

**Service Layer**:
- ✅ `lib/products/variants/service.ts` - Full CRUD with validation
- Functions: `getProductVariants`, `createProductVariant`, `updateProductVariant`, `deleteProductVariant`
- Validation: SKU uniqueness (store-level), option_values uniqueness, inventory validation, publish validation

**API Routes**:
- ✅ `app/api/products/[id]/variants/route.ts` - GET, POST
- ✅ `app/api/products/[id]/variants/[variantId]/route.ts` - PUT, DELETE

**UI Components**:
- ✅ `components/product/ProductCreateDialog.tsx` - Has variants state
- ✅ `components/product/create/ProductVariantEntry.tsx` - Variant entry UI

**Current Status**: **REAL** - Database, model, service, API all exist

**Source of Truth**: Database `product_variants` table

**Known Problems**:
- None for the creation path: the P0 flow now generates `product_variants` rows from the option combinations during product creation via `createProductWithVariants`.
- **APPLICATION-LEVEL SKU UNIQUENESS** (per `20260817_000001_add_product_variant_domain.sql`): there is no DB-level unique constraint on `product_variants.sku`; uniqueness is enforced at the service layer (`checkSKUUniqueness` in `lib/products/variants/service.ts`). A future migration may add a DB-level constraint if deemed low risk.

---

### 5. Cart

**Purpose**: User's current shopping session (temporary, client-side)

**Database Table**: ❌ Does not exist
- Cart is client-side only (localStorage)
- No server-side persistence

**TypeScript Model**:
- ✅ `lib/storefront/types.ts` - `CartItem` interface

**Service Layer**: ❌ Does not exist
- Cart logic is in React Context only

**API Routes**: ❌ Does not exist
- No cart API endpoints

**UI Components**:
- ✅ `components/cart/CartContext.tsx` - React Context with localStorage persistence
- ✅ `components/cart/CartDrawer.tsx` - Cart drawer UI
- ✅ `components/cart/CartPageView.tsx` - Cart page UI
- ✅ `components/cart/NavbarCartButton.tsx` - Navbar cart button

**Current Status**: **MOCK ONLY** - Client-side only, no database persistence

**Source of Truth**: localStorage (per store slug)

**Known Problems**:
- No server-side cart persistence
- Cart data lost if localStorage cleared
- No cart sharing across devices
- No cart abandonment recovery

---

### 6. Cart Item

**Purpose**: Individual item in shopping cart

**Database Table**: ❌ Does not exist (same as Cart)

**TypeScript Model**:
- ✅ `lib/storefront/types.ts` - `CartItem` interface
  - Fields: id, productId, variantId, quantity, productName, image, price, currency, selectedOptions, sku

**Service Layer**: ❌ Does not exist (same as Cart)

**API Routes**: ❌ Does not exist (same as Cart)

**UI Components**: Same as Cart

**Current Status**: **MOCK ONLY** - Client-side only

**Source of Truth**: localStorage (within CartContext)

**Known Problems**: Same as Cart

---

### 7. Order

**Purpose**: Customer purchase order (transaction record)

**Database Table**: `orders`
- ✅ Exists with full schema
- Columns: id, store_id, order_number, customer_name, customer_email, customer_phone, customer_whatsapp, company, country, state, city, address, notes, contact_preference, currency, subtotal, status, created_at, updated_at
- RLS: Enabled with public insert and store owner management

**TypeScript Model**:
- ✅ `lib/storefront/types.ts` - `OrderConfirmationDTO`

**Service Layer**:
- ✅ `app/actions/order.ts` - `submitOrderInquiryAction`, `getOrderConfirmationAction`
- Server-side price recalculation from database
- Memory fallback for demo sessions

**API Routes**:
- ✅ Server actions (no direct API routes, uses Next.js server actions)

**UI Components**:
- ✅ `components/checkout/CheckoutPageView.tsx` - Checkout form
- ✅ `components/checkout/OrderConfirmationPageView.tsx` - Order confirmation

**Current Status**: **REAL** - Fully implemented

**Source of Truth**: Database `orders` table

**Known Problems**: None critical - working as designed for inquiry-based commerce

---

### 8. Order Line (Order Item)

**Purpose**: Individual items in an order (transaction line items)

**Database Table**: `order_items`
- ✅ Exists with full schema
- Columns: id, order_id, product_id, variant_id, product_name_snapshot, sku_snapshot, quantity, unit_price_snapshot, currency, selected_options (jsonb), created_at
- RLS: Enabled with public insert and store owner management
- **Snapshot preservation**: product_name_snapshot, sku_snapshot, unit_price_snapshot

**TypeScript Model**:
- ✅ `lib/storefront/types.ts` - `OrderConfirmationItem`, `OrderItemSubmission`

**Service Layer**:
- ✅ `app/actions/order.ts` - Integrated in order submission
- Server-side price validation and recalculation

**API Routes**: ✅ Integrated in order server actions

**UI Components**: ✅ OrderConfirmationPageView displays order items

**Current Status**: **REAL** - Fully implemented with snapshot preservation

**Source of Truth**: Database `order_items` table

**Known Problems**: None - Snapshot mechanism is correctly implemented

---

### 9. Snapshot

**Purpose**: Historical preservation of transaction data (immutable)

**Database Tables**:
- ✅ `order_items` - Contains snapshot columns:
  - `product_name_snapshot` - Product name at time of order
  - `sku_snapshot` - SKU at time of order
  - `unit_price_snapshot` - Unit price at time of order
  - `selected_options` - Selected options as jsonb

**TypeScript Model**:
- ✅ `lib/storefront/types.ts` - Snapshot fields in `OrderConfirmationItem`

**Service Layer**:
- ✅ `app/actions/order.ts` - Snapshot creation during order submission
- Server fetches current product/variant data and snapshots it

**API Routes**: ✅ Integrated in order server actions

**UI Components**: ✅ OrderConfirmationPageView displays snapshot data

**Current Status**: **REAL** - Correctly implemented

**Source of Truth**: Database `order_items` snapshot columns

**Known Problems**: None - Snapshot mechanism prevents historical data drift

---

### 10. Fulfillment

**Purpose**: Post-order packaging, shipping, delivery logistics

**Database Tables**: ❌ Does not exist
- No fulfillment tables
- No shipment tables
- No tracking tables

**TypeScript Model**: ❌ Does not exist
- No fulfillment interfaces

**Service Layer**: ❌ Does not exist
- No fulfillment service functions

**API Routes**: ❌ Does not exist
- No fulfillment endpoints

**UI Components**: ❌ Does not exist
- No fulfillment UI
- Only mentions in checkout as "Shipping & Insurance: Coordinated post-inquiry"

**Current Status**: **MISSING** - Not implemented

**Source of Truth**: N/A

**Known Problems**:
- Complete absence of fulfillment domain
- No way to track shipping status
- No way to manage packaging
- No delivery confirmation
- Current system is inquiry-only, not full e-commerce

---

## Current Data Flow

### Actual Flow (Post-P0, 2026-08-26)

```
ProductCreateDialog (UI)
  ↓
POST /api/merchant/products
  ↓
createProductWithVariants()  ← lib/products/product-with-variants-service.ts
  ├── INSERT products
  ├── POST /api/products/[id]/options  (or direct call to createProductOption)
  │     ↓
  │     INSERT product_options
  └── POST /api/products/[id]/variants  (or direct call to createProductVariant)
        ↓
        INSERT product_variants  (Cartesian product of options, status='draft')
  ↓
Product + Options + Variants (in database)
  ↓
Storefront (display with variant selection)
  ↓
CartContext (localStorage only) ← MOCK ONLY
  ↓
CheckoutPageView (UI)
  ↓
submitOrderInquiryAction (server action)
  ↓
orders table (database, REAL)
  ↓
order_items table (database with snapshots, REAL)
  ↓
[NO FULFILLMENT] ← MISSING
```

### Still Pending (Future Tasks)

```
Cart → migrate to database (currently MOCK ONLY)
Fulfillment → missing entirely (no tables, no service, no UI)
```

### Domain Truth Summary (2026-08-26)

| Object | Status | Notes |
|---|---|---|
| Product | REAL | `products` table |
| Product Option | REAL | `product_options` table — written by P0 orchestrator |
| Product Variant | REAL | `product_variants` table — written by P0 orchestrator |
| Cart | MOCK ONLY | localStorage only |
| Cart Item | MOCK ONLY | localStorage only |
| Order | REAL | `orders` table |
| Order Line | REAL | `order_items` table with snapshots |
| Snapshot | REAL | embedded in `order_items` |
| Fulfillment | MISSING | no tables / service / UI |

---

## Product Attribute vs Variant Attribute Rules

### Current Implementation

**Product-Level Attributes**:
- `product_attributes` table supports `variant_id` (nullable)
- When `variant_id` is NULL, attribute applies to all variants
- When `variant_id` is set, attribute applies to specific variant

**No Explicit Rules Currently Defined**:
- No business logic to determine what should be product-level vs variant-level
- All attributes can theoretically be set at either level

### Recommended Rules

**Product-Level Attributes** (apply to all variants):
- Material (e.g., "Silk", "Cotton")
- Origin (e.g., "China", "Italy")
- Brand/Designer
- Collection/Season
- Care instructions
- Certifications

**Variant-Level Attributes** (differ between variants):
- Color (e.g., "White", "Black")
- Size (e.g., "S", "M", "L")
- Weight (e.g., "230g", "250g")
- Specific dimensions (e.g., "145x48x140mm")
- Variant-specific images
- Variant-specific inventory

**Implementation Needed**:
- Add business logic in attribute service to validate level assignment
- Add UI guidance in ProductCreateDialog
- Add validation in attribute domain service

---

## Migration Path

### Phase 1: Fix ProductCreateDialog Option/Variant Creation ✅ DONE (2026-08-26, P0)

- Modified `ProductCreateDialog.tsx` submit handler: `options` sent at top level (not in `raw_data`).
- `/api/merchant/products` delegates to `createProductWithVariants()` which writes real `product_options` and `product_variants` rows.
- Removed the legacy `POST /api/merchant/products/[id]/composition` (Origin-as-assembly anti-pattern).
- Compensation rollback hardened: failures now surface via the returned `error`.
- 8 Vitest tests added in `lib/products/__tests__/product-with-variants-service.test.ts`.

### Phase 2: Implement Cart Domain

1. Create `carts` table:
   - id, user_id (nullable for guest), session_id, store_id, created_at, updated_at

2. Create `cart_items` table:
   - id, cart_id, product_id, variant_id, quantity, selected_options, created_at

3. Create cart service layer:
   - `getCart`, `createCart`, `addItem`, `updateQuantity`, `removeItem`, `clearCart`

4. Create cart API routes:
   - `/api/cart` - GET, POST
   - `/api/cart/items` - POST, PUT, DELETE

5. Update CartContext:
   - Use API instead of localStorage
   - Sync with server

### Phase 3: Implement Fulfillment Domain

1. Create `fulfillments` table:
   - id, order_id, status, carrier, tracking_number, estimated_delivery, actual_delivery, created_at, updated_at

2. Create `shipments` table:
   - id, fulfillment_id, tracking_number, carrier, shipping_method, cost, weight, dimensions, created_at

3. Create fulfillment service layer

4. Create fulfillment API routes

5. Create fulfillment UI components

---

## Conclusion

### Strengths
- Product domain is well-implemented and now correctly writes to `products` / `product_options` / `product_variants` (P0 fix).
- Order/OrderLine with snapshot preservation is correct.
- Variant domain infrastructure is now actually used in the creation flow.

### Open Critical Issues (after P0)
1. **Cart is client-side only** — no database persistence.
2. **Fulfillment domain is completely missing**.

### Resolved by P0 (2026-08-26)
1. ✅ ProductCreateDialog now creates real Option/Variant records (was: writing to `raw_data.options`).
2. ✅ `products.category` / `products.category_id` are no longer written as top-level columns (DB schema doesn't have them).
3. ✅ Fake `/composition` POST with `component_type='assembly'` removed.
4. ✅ Compensation rollback surfaces partial state instead of pretending success.

### Recommended Priority
1. **MEDIUM**: Implement server-side Cart domain.
2. **LOW**: Implement Fulfillment domain (inquiry-based commerce may not need it immediately).
3. **NEXT HARDENING TASK** (deferred): Replace compensation rollback with a PostgreSQL RPC `create_product_with_variants(...)` for true atomicity. Tracked in `PRODUCT_VARIANT_FLOW_REPORT.md`.

### Data Sovereignty Status
- ✅ Product: Database
- ✅ Product Knowledge: Database (new domain tables)
- ✅ Product Option: Database (used in creation flow as of P0)
- ✅ Product Variant: Database (used in creation flow as of P0)
- ❌ Cart: localStorage (needs migration to database)
- ✅ Order: Database
- ✅ Order Line: Database with snapshots
- ✅ Snapshot: embedded in `order_items`
- ❌ Fulfillment: Missing
