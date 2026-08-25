# Product Attribute Refactor - Architecture Summary

## Overview

This document summarizes the refactoring of the product attribute handling system in the Omnilink project. The refactoring replaces scattered individual attribute states with a unified canonical attribute system and introduces domain-specific database tables for better data organization and scalability.

## Objectives Achieved

1. **Replaced Individual States with Canonical Attributes**
   - Removed hardcoded states: `coreMaterial`, `coreDimensions`, `coreWeight`, `coreOrigin`
   - Implemented unified `canonicalAttributes` state array
   - Added dynamic attribute management with quick-add buttons

2. **Created Domain-Specific Database Tables**
   - `product_attributes`: General physical/measurable attributes
   - `product_composition`: Material/component composition data
   - `product_content`: Marketing content, features, SEO data

3. **Implemented Legacy Compatibility Layer**
   - Migration functions to transfer data from `raw_data` to new tables
   - Sync functions to maintain `raw_data` for backward compatibility
   - Conversion helpers between canonical and domain formats

4. **Updated UI and API**
   - Refactored `ProductCreateDialog.tsx` to use canonical attributes
   - Created new API routes for attribute domains
   - Maintained existing API contract for backward compatibility

## Architecture Changes

### Database Schema

#### New Tables

**product_attributes**
```sql
- id (uuid, PK)
- product_id (uuid, FK → products)
- variant_id (uuid, FK → product_variants, nullable)
- field_key (text)
- label (text, nullable)
- value (text)
- value_type (text: 'text' | 'number' | 'boolean' | 'select')
- unit (text, nullable)
- source (text: 'manual' | 'system' | 'ai')
- confidence (numeric)
- is_standard (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

**product_composition**
```sql
- id (uuid, PK)
- product_id (uuid, FK → products)
- variant_id (uuid, FK → product_variants, nullable)
- component_name (text)
- component_type (text: 'material' | 'part' | 'ingredient' | 'assembly')
- material_code (text, nullable)
- percentage (numeric, nullable)
- quantity (numeric, nullable)
- quantity_unit (text, nullable)
- supplier_name (text, nullable)
- origin_country (text, nullable)
- is_primary (boolean)
- notes (text, nullable)
- created_at (timestamptz)
- updated_at (timestamptz)
```

**product_content**
```sql
- id (uuid, PK)
- product_id (uuid, FK → products)
- content_type (text: 'feature' | 'benefit' | 'description' | 'seo_title' | 'seo_description' | 'seo_keywords')
- language (text)
- title (text, nullable)
- body (text, nullable)
- position (integer)
- meta_title (text, nullable)
- meta_description (text, nullable)
- keywords (text[], nullable)
- is_visible (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)
```

### TypeScript Models

**File**: `lib/products/product-attribute-domains.ts`

- `ProductAttribute`: Interface for general attributes
- `ProductComposition`: Interface for composition data
- `ProductContent`: Interface for content/SEO data
- `CreateProductAttributeInput`: Input type for creating attributes
- `UpdateProductAttributeInput`: Input type for updating attributes
- `canonicalToProductAttribute()`: Conversion helper
- `productAttributeToCanonical()`: Reverse conversion helper

### Service Layer

**File**: `lib/products/attribute-domains-service.ts`

**ProductAttribute Service**:
- `getProductAttributes()`: Fetch attributes for a product/variant
- `createProductAttribute()`: Create a single attribute
- `updateProductAttribute()`: Update an existing attribute
- `deleteProductAttribute()`: Remove an attribute
- `batchCreateProductAttributes()`: Bulk create attributes

**ProductComposition Service**:
- `getProductCompositions()`: Fetch composition data
- `createProductComposition()`: Create composition entry
- `updateProductComposition()`: Update composition entry
- `deleteProductComposition()`: Remove composition entry

**ProductContent Service**:
- `getProductContents()`: Fetch content/SEO data
- `createProductContent()`: Create content entry
- `updateProductContent()`: Update content entry
- `deleteProductContent()`: Remove content entry

### Legacy Compatibility

**File**: `lib/products/attribute-domains-legacy.ts`

**Migration Functions**:
- `migrateLegacyAttributes()`: Migrates data from `raw_data` to new domain tables
- `syncToLegacy()`: Syncs new domain data back to `raw_data`
- `getUnifiedAttributes()`: Returns unified view from both systems

**Conversion Functions**:
- `domainToCanonical()`: Converts domain attributes to canonical format
- `canonicalToDomain()`: Converts canonical attributes to domain format

### API Routes

**New Endpoints**:
- `GET/POST /api/merchant/products/[id]/attributes` - Attribute CRUD
- `GET/POST /api/merchant/products/[id]/composition` - Composition CRUD
- `GET/POST /api/merchant/products/[id]/content` - Content/SEO CRUD

**Existing Endpoints** (unchanged):
- `POST /api/merchant/products` - Product creation
- `POST /api/merchant/products/[id]/ai-draft/apply` - Semantic attribute application

### UI Changes

**File**: `components/product/ProductCreateDialog.tsx`

**Before**:
```typescript
const [coreMaterial, setCoreMaterial] = useState('')
const [coreDimensions, setCoreDimensions] = useState('')
const [coreWeight, setCoreWeight] = useState('')
const [coreOrigin, setCoreOrigin] = useState('')
```

**After**:
```typescript
const [canonicalAttributes, setCanonicalAttributes] = useState<
  Array<{
    key: string
    label: string
    value: string
    type: 'text' | 'number' | 'boolean' | 'select'
    unit: string | null
    confidence: number
  }>
>([])
```

**UI Improvements**:
- Dynamic attribute list rendering
- Quick-add buttons for common attributes (Material, Dimensions, Weight, Origin)
- Type-aware input fields (text vs number)
- Unit display for attributes with units

## Migration Path

### Step 1: Database Migration
Run the migration to create new tables:
```bash
supabase migration up --file 20260822_000001_add_product_attribute_domain.sql
```

### Step 2: Data Migration
For existing products, migrate legacy data:
```typescript
import { migrateLegacyAttributes } from '@/lib/products/attribute-domains-legacy'

// For each product
await migrateLegacyAttributes(productId)
```

### Step 3: Application Update
The application code has been updated to use the new system. No additional changes required.

### Step 4: Rollback (if needed)
If issues arise, rollback the migration:
```bash
supabase migration down --file 20260822_000002_rollback_product_attribute_domain.sql
```

## Benefits

1. **Scalability**: New attributes can be added without UI changes
2. **Type Safety**: Structured TypeScript interfaces prevent runtime errors
3. **Query Performance**: Indexed columns for efficient queries
4. **Data Organization**: Domain separation for better data management
5. **Backward Compatibility**: Legacy `raw_data` maintained during transition
6. **Variant Support**: All domains support variant-level attributes

## Testing

- **Lint**: Passed with 0 errors, 299 warnings (pre-existing)
- **Build**: Successful compilation
- **TypeScript**: All type checks passed

## Files Created

1. `supabase/migrations/20260822_000001_add_product_attribute_domain.sql`
2. `supabase/migrations/20260822_000002_rollback_product_attribute_domain.sql`
3. `lib/products/product-attribute-domains.ts`
4. `lib/products/attribute-domains-service.ts`
5. `lib/products/attribute-domains-legacy.ts`
6. `app/api/merchant/products/[id]/attributes/route.ts`
7. `app/api/merchant/products/[id]/composition/route.ts`
8. `app/api/merchant/products/[id]/content/route.ts`

## Files Modified

1. `components/product/ProductCreateDialog.tsx`
   - Replaced individual attribute states with `canonicalAttributes`
   - Updated submit function to use canonical attributes
   - Added dynamic attribute rendering UI

## Next Steps

1. **Deploy Database Migration**: Run the migration in production
2. **Migrate Existing Data**: Run migration script for existing products
3. **Monitor**: Monitor performance and error logs after deployment
4. **Cleanup**: After successful transition, consider deprecating `raw_data` usage

## Conclusion

The refactoring successfully modernizes the product attribute system, providing a scalable, type-safe, and well-organized foundation for future enhancements. The legacy compatibility layer ensures a smooth transition without disrupting existing functionality.
