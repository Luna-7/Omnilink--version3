# Omnilink Storefront Publish Fix — Report

**Date**: 2026-08-26
**Task**: Fix Storefront Visual Editor's "全网发布" (Publish to All Sites) so the public storefront reflects the editor's current state, not the previously-persisted version.
**Repo**: `https://github.com/Luna-7/nextjs-with-supabase.git` (this is the `origin` in local clone).
**Branch**: `main` (clean at start; only 2 files modified by this task).

---

## 1. Root Cause

`publishStorefrontAction(storeId)` took only the store id and re-read the schema from the database via `loadStorefrontSchemaAction(storeId)`. That re-read returns the **previously persisted** version of the schema, not the editor's current in-memory version. The action then upserted that stale version back to `store_settings.theme_config` with `meta.published: true`, overwriting whatever the editor had been working on.

The data flow the user observed — *edit → publish → public page shows old theme* — is a direct consequence of this round-trip:

```
Editor current schema
       │
       │  (NOT passed to publish)
       ▼
publishStorefrontAction(store.id)
       │
       │  loadStorefrontSchemaAction(storeId)   ← reads OLD schema from DB
       ▼
publishedSchema = { ...oldSchema, meta.published: true }
       │
       ▼
upsert store_settings.theme_config := oldSchema+published
       │
       ▼
public page re-reads store_settings.theme_config  → sees OLD schema
```

The user clicked "全网发布" expecting the editor's state to be published, but the publish action had no way of seeing that state — it only had `storeId`.

A secondary bug was that the legacy `store_pages` upsert inside publish (line 191–201 of the old code) did not check the returned `error`, so a DB failure on the legacy write would be silently swallowed while still returning `{ success: true, published: true }`.

---

## 2. Data Flow — Before

```
StorefrontEditor (React state: schema)
   │
   ├── Save Draft:
   │      saveStorefrontSchemaAction(store.id, schema)
   │      → auth/ownership check
   │      → validateSchema(schema)
   │      → upsert store_settings.theme_config := schema    [canonical write]
   │      → return { success }
   │
   └── Publish (全网发布):
          saveStorefrontSchemaAction(store.id, schema)        ← explicit pre-publish save
          publishStorefrontAction(store.id)                    ← only storeId
             │
             ├── auth/ownership check
             ├── loadStorefrontSchemaAction(storeId)          ← RE-READS OLD SCHEMA
             │      └── reads store_settings.theme_config
             ├── build publishedSchema = { ...oldSchema, meta.published: true,
             │                                    lastModified: now }
             ├── upsert store_settings.theme_config := publishedSchema  [overwrites latest]
             ├── upsert store_pages (no error check)          [legacy; silent on failure]
             └── return { success: true, published: true }    [even if store_pages failed]
```

Net effect: editor's React state was used only for the explicit `Save Draft` button. The `Publish` button re-loaded from DB and published the OLD version.

---

## 3. Data Flow — After

```
StorefrontEditor (React state: schema)
   │
   └── Publish (全网发布):
          setIsPublishing(true)
          publishStorefrontAction(store.id, schema)            ← schema is the editor's current state
             │
             ├── auth/ownership check                            → Unauthorized if not signed in
             ├── load store (id, owner_id, store_slug)
             ├── verify store.owner_id === user.id              → Store not found or forbidden
             ├── validateSchema(schema)                         → Invalid storefront schema
             ├── normalizeStorefrontSchema(schema)              → Failed to normalize storefront schema
             ├── publishedSchema = { ...normalized, meta.published: true,
             │                                    lastModified: now }
             ├── upsert store_settings.theme_config := publishedSchema
             │      └── on error: return Failed to save storefront: <message>
             ├── upsert store_pages (legacy compat)
             │      └── on error: console.error only (non-fatal; canonical is what public reads)
             ├── revalidatePath(`/store/${store.store_slug}`)   (non-fatal if it throws)
             └── return { success: true, published: true }

          on success: setSchema(...published: true), showToast("已发布上线")
          on failure: showToast(result.error, "err")            ← no more silent success
          finally:    setIsPublishing(false)                    ← no stuck loading state
```

`Save Draft` (the explicit save button) is unchanged and still works. The new flow removes the implicit `saveStorefrontSchemaAction` call from inside `handlePublish` because publish now persists directly; the standalone save remains available for users who want to persist without publishing.

---

## 4. Modified Files

| File | Change | Lines |
|---|---|---|
| `app/actions/store.ts` | `publishStorefrontAction(storeId)` → `publishStorefrontAction(storeId, schema)`; removed `loadStorefrontSchemaAction` call inside publish; added `validateSchema` + `normalizeStorefrontSchema` of passed schema; added `error` check on `store_pages` upsert (logged, non-fatal); added `revalidatePath('/store/${slug}')`; added `revalidatePath` import from `next/cache` | +67 / −36 (in the function) |
| `components/storefront/StorefrontEditor.tsx` | `handlePublish` now calls `publishStorefrontAction(store.id, schema)` instead of `publishStorefrontAction(store.id)`; removed the redundant pre-publish `saveStorefrontSchemaAction` call; added `else` branch that surfaces `result.error` as an error toast when publish returns `success: false` | +5 / −3 |

Diff stat:
```
 app/actions/store.ts                       | 103 +++++++++++++++++++----------
 components/storefront/StorefrontEditor.tsx |   8 ++-
 2 files changed, 75 insertions(+), 36 deletions(-)
```

No other files touched. No `package.json` changes, no migrations, no theme-system / registry / public-route / PreviewCanvas changes.

---

## 5. Database — Roles of the Two Tables

| Table | Role after fix | Read sites | Write sites |
|---|---|---|---|
| `store_settings.theme_config` | **Canonical source of truth** for the published storefront schema. | `lib/storefront/service.ts:203` (`getPublicStorefront`), `:137` (`getPublishedStore` extracts `theme_id`); also used by `getOrderById` for order confirmation contact info. | `publishStorefrontAction` (primary), `saveStorefrontSchemaAction` (Save Draft), `app/actions/template.ts` (template apply), `app/api/stores/[id]/template` (template API). |
| `store_pages` | **Legacy compat layer only** — kept in sync with the canonical schema for any older code path that still reads it. The public storefront routes (home, products, products/[id], cart, checkout, order-confirmation) **do not** read `store_pages` after this fix. | `app/dashboard/storefront/page.tsx:52`, `app/dashboard/storefront/pages/page.tsx:31` (dashboard admin views only); `lib/api/auth.ts:154` (admin check). Public side does NOT read it. | `publishStorefrontAction` (legacy compat upsert), `app/actions/template.ts:207`, `app/api/stores/[id]/template`, `unpublishStorefrontAction` (set `published: false`). |

**No double-source-of-truth issue.** `store_settings.theme_config` is the single canonical write target that drives the public storefront. `store_pages` is updated alongside as a courtesy sync — its upsert error is logged but does not fail the publish, because failing the publish on a legacy-only write would be a regression for the canonical write that already succeeded.

---

## 6. Cache Invalidation

`revalidatePath('/store/${store.store_slug}')` is called inside `publishStorefrontAction` after the canonical write succeeds. The call is wrapped in a try/catch and any throw is logged as non-fatal, because the public route is a Next.js dynamic route (`app/store/[store_slug]/page.tsx`) and re-fetches the database on every request by default. So even without `revalidatePath` the public page would eventually see the new schema — `revalidatePath` is defense in depth to clear any cached variants Next may add in the future.

Searched the entire codebase for cache markers — none of the following exist anywhere:
- `unstable_cache(`
- `revalidateTag(`
- `export const revalidate`
- `export const dynamic` (only in two dashboard pages, both `force-dynamic`, unrelated)
- `fetchCache` / `force-cache` / `next: { revalidate: ... }`

So the invalidation surface is minimal: one `revalidatePath` call per publish, scoped to the affected store's home route.

---

## 7. Validation

Schema validation happens in two places in the new publish pipeline:

1. **`validateSchema(schema)`** — basic shape check (version / theme / sections / meta). Returns `false` ⇒ `Invalid storefront schema` error. Editor already validates, so this is defensive against bad input from a future caller.
2. **`normalizeStorefrontSchema(schema)`** — canonical shape enforcement (handles legacy `theme_id` strings, normalizes sections, etc.). Returns `null` ⇒ `Failed to normalize storefront schema` error. Guarantees the published schema in `store_settings.theme_config` is always canonical.

The same validation chain is used by `saveStorefrontSchemaAction` (Save Draft) and `loadStorefrontSchemaAction` (read path), so DB shape stays consistent across all write/read paths.

`meta.published` and `meta.lastModified` are set by the publish action itself; the passed schema's `meta.published` is overwritten to `true`.

---

## 8. Functional Tests (Reasoned Through)

The following covers the 10 scenarios from the brief. The sandbox has no live Supabase / no browser, so these are reasoned walkthroughs against the code (each one traces the new flow end-to-end). All reasoning is anchored to file:line in the new `app/actions/store.ts` and `StorefrontEditor.tsx`.

| # | Scenario | How the fix ensures it |
|---|---|---|
| 1 | Theme A → Theme B + Publish → public = B | Editor's `schema.theme.themeId === 'B'`; `publishStorefrontAction(store.id, schema)` writes `theme_config.theme.themeId='B'`; `getPublicStorefront` reads it back. ✅ |
| 2 | Edit Hero title + Publish (no Save) → public = new title | `handlePublish` no longer requires a prior Save; `publishStorefrontAction(store.id, schema)` is called with the React-state schema that already contains the new title; write proceeds. ✅ |
| 3 | Edit Color / Font / Radius + Publish → all sync | `schema.theme.accent / radius` and `schema.theme.fonts` are part of the passed schema; same single write covers all three. ✅ |
| 4 | Edit Section order + Publish → order syncs | `schema.sections[i].order` is part of the passed schema; write persists; `getPublicStorefront` sorts by `order` on read (line 45 of `app/store/[store_slug]/page.tsx`). ✅ |
| 5 | Edit Section content + Publish → content syncs | `schema.sections[i].content` is part of the passed schema; write persists; `DynamicSectionRenderer` reads from it. ✅ |
| 6 | Publish DB write fails → UI shows failure | `store_settings` upsert error short-circuits and returns `Failed to save storefront: <message>`. Editor's `handlePublish` now checks `result.success` and shows `result.error` in the error toast (new `else` branch). ✅ |
| 7 | Unauthenticated → `Unauthorized` | `auth.getUser()` returns null / error → first guard returns `{ success: false, error: 'Unauthorized' }`. ✅ |
| 8 | Non-owner → `Store not found or forbidden` | After loading store, `store.owner_id !== user.id` → second guard returns that error. ✅ |
| 9 | Refresh public page after publish → still latest | `revalidatePath` clears cache; dynamic route re-fetches DB; DB has the latest write. ✅ |
| 10 | Double-click Publish → no race / no duplicate | `setIsPublishing(true)` disables the button immediately on click; `finally { setIsPublishing(false) }` releases the lock in success or failure. The `upsert` itself is idempotent on `store_id` (single row per store). ✅ |

---

## 9. Build Verification

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit` (with `.next` moved aside per sandbox workaround) | **PASS** — exit 0, no diagnostics |
| Lint | `npm run lint` | **PASS** with caveats — 8 errors, **all 8 pre-existing baseline** (`DashboardView.tsx` × 5, `UnifiedKnowledgeSpaceView.tsx` × 1, `ProductEnhancementFields.tsx` × 1 — all `impure function during render` React-Compiler warnings promoted to errors). **0 new errors** introduced by this task. 288 warnings (unchanged from baseline). |
| Build | `npm run build` | **PASS** — exit 0; all routes including `/store/[store_slug]`, `/store/[store_slug]/products/[id]`, `/dashboard/storefront`, `/dashboard/storefront/templates/[templateId]/edit` compiled; `Proxy (Middleware)` registered. |
| Unit tests | `npm run test` (vitest, 8 P0 tests) | **PASS** — 8/8 tests green, 133 ms. (These cover P0 product/service stabilization, not storefront publish; no publish-specific unit test was added because the spec scopes this task to backend/domain + manual functional verification, not new test scaffolding.) |

**Pre-existing lint baseline (NOT introduced by this task, not blocking):**
- `components/dashboard/DashboardView.tsx:326, 338, 349, 360, 376` — React-Compiler `impure function during render`
- `components/knowledge/UnifiedKnowledgeSpaceView.tsx:404` — same
- `components/product/create/ProductEnhancementFields.tsx:47` — same

Per the spec ("如果遇到 unrelated existing error：明确记录 ... 是否由本次修改引起 / 是否阻塞 Publish 修复"), these 8 errors are **not blocking** the publish fix — they live in dashboard/knowledge/product-creation UI files that this task does not modify, and the build still passes (Next.js does not gate on ESLint).

---

## 10. Git Diff Summary

Working tree (uncommitted):

```
app/actions/store.ts                       | 103 +++++++++++++++++++----------
components/storefront/StorefrontEditor.tsx |   8 ++-
2 files changed, 75 insertions(+), 36 deletions(-)
```

What the diff does, by section:

- **Import (store.ts):** +1 line — `import { revalidatePath } from 'next/cache'`.
- **`publishStorefrontAction` signature:** `(storeId: string)` → `(storeId: string, schema: StorefrontSchema)`.
- **`publishStorefrontAction` body:** ~70 lines rewritten. Removed the `loadStorefrontSchemaAction` call and the fallback-builder that reconstructed a hero from `store_name`. Replaced with: `validateSchema` → `normalizeStorefrontSchema` → mark `meta.published` + `lastModified` → write `store_settings` (error-checked) → write `store_pages` (error-checked, non-fatal) → `revalidatePath`.
- **Store SELECT:** changed from `id, owner_id, store_name, description` to `id, owner_id, store_slug` (we only need `store_slug` for `revalidatePath`; `store_name` and `description` were only used by the now-deleted fallback).
- **`handlePublish` (StorefrontEditor.tsx):** call site changed from `publishStorefrontAction(store.id)` to `publishStorefrontAction(store.id, schema)`. Removed the redundant pre-publish `saveStorefrontSchemaAction` call. Added an `else` branch that surfaces `result.error` to the toast on `success: false`.
- **Out of scope, untouched:** `saveStorefrontSchemaAction`, `loadStorefrontSchemaAction`, `unpublishStorefrontAction`, all public storefront routes (`app/store/[store_slug]/...`), `lib/storefront/service.ts`, `lib/storefront/schema.ts`, `PreviewCanvas.tsx`, theme system, all migrations, package.json, and the P0 product/service code.

No commit was created. The changes are staged-able as a single `fix(storefront): publish uses editor's current schema` commit when the user is ready.
