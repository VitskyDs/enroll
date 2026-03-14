---
id: TASK-17
title: Add products table to the database
status: Done
assignee: []
created_date: '2026-03-05 20:57'
updated_date: '2026-03-14 18:19'
labels: []
milestone: m-3
dependencies: []
priority: medium
ordinal: 22000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a normalized `products` table (plus `product_variants` and `product_options`) to support both service businesses that sell retail products alongside their services (e.g. a salon selling shampoo) and pure product retailers.

## Schema design rationale

Cross-referencing Shopify, Stripe, Square, and WooCommerce product objects, the following column groups are standard:

- **Identity** — name, description, SKU, barcode
- **Kind** — physical / digital / service_addon (lets the app treat retail products differently from bookable services)
- **Pricing** — selling price, compare-at (crossed-out) price, and cost price, all in cents to avoid float precision issues
- **Inventory** — opt-in tracking flag, quantity, and a low-stock threshold
- **Variants** — products can have variants (e.g. size, scent, color); handled via two join tables (`product_options` defines the axes, `product_variants` stores each combination)
- **Media** — image URLs as a simple array; no separate media table needed at this stage
- **Status** — active / draft / archived lifecycle
- **Loyalty integration** — `points_eligible` and `points_override` so individual products can opt out of points earning or carry a custom point value instead of the global earn rate

## Migration

Create three tables in a single migration named `create_products`:

### `products`
| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `created_at` | `timestamptz` | `now()` |
| `updated_at` | `timestamptz` | `now()` |
| `business_id` | `uuid` FK → `businesses.id` | NOT NULL |
| `name` | `text` | NOT NULL |
| `description` | `text` | nullable |
| `sku` | `text` | nullable |
| `barcode` | `text` | nullable |
| `category` | `text` | nullable |
| `tags` | `text[]` | NOT NULL, default `'{}'` |
| `kind` | `text` | NOT NULL, default `'physical'`; check in `('physical','digital','service_addon')` |
| `price_cents` | `bigint` | NOT NULL |
| `compare_at_price_cents` | `bigint` | nullable — used for "was $X" display |
| `cost_cents` | `bigint` | nullable — cost of goods for margin tracking |
| `track_inventory` | `boolean` | NOT NULL, default `false` |
| `inventory_quantity` | `integer` | nullable; only meaningful when `track_inventory = true` |
| `low_stock_threshold` | `integer` | nullable; alert trigger level |
| `has_variants` | `boolean` | NOT NULL, default `false` |
| `image_urls` | `text[]` | NOT NULL, default `'{}'` |
| `status` | `text` | NOT NULL, default `'active'`; check in `('active','draft','archived')` |
| `featured` | `boolean` | NOT NULL, default `false` |
| `sort_order` | `integer` | NOT NULL, default `0` |
| `points_eligible` | `boolean` | NOT NULL, default `true` |
| `points_override` | `integer` | nullable; if set, overrides the program's global earn rate for this product |

Add index on `(business_id, status)` for the most common query pattern.

### `product_options`
Defines the variant axes (e.g. "Size" with values ["S", "M", "L"]).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `product_id` | `uuid` FK → `products.id` ON DELETE CASCADE | NOT NULL |
| `name` | `text` | NOT NULL — e.g. "Size", "Color", "Scent" |
| `position` | `integer` | NOT NULL, default `0` — display order |
| `values` | `text[]` | NOT NULL — e.g. `'{"S","M","L"}'` |

### `product_variants`
One row per variant combination (e.g. "Small / Blue").

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | |
| `created_at` | `timestamptz` | `now()` |
| `product_id` | `uuid` FK → `products.id` ON DELETE CASCADE | NOT NULL |
| `name` | `text` | NOT NULL — e.g. "Small / Blue" |
| `sku` | `text` | nullable |
| `barcode` | `text` | nullable |
| `price_cents` | `bigint` | nullable — `null` means inherit from parent product |
| `compare_at_price_cents` | `bigint` | nullable |
| `cost_cents` | `bigint` | nullable |
| `inventory_quantity` | `integer` | nullable |
| `option1_value` | `text` | nullable |
| `option2_value` | `text` | nullable |
| `option3_value` | `text` | nullable |
| `image_url` | `text` | nullable |
| `sort_order` | `integer` | NOT NULL, default `0` |

Add index on `product_id` for both join tables.

## RLS policies

Enable RLS on all three tables. Follow the same pattern as the existing tables:
- Allow all operations for authenticated users scoped to their own business's rows (`business_id = (select id from businesses where ... )` or via a `business_id` the user owns).
- For now, a simple policy that allows access for authenticated users is acceptable while auth is still being fleshed out (match what `businesses` and `services` currently do).

## TypeScript types

Add to `src/types/index.ts`:

```ts
export type ProductKind = 'physical' | 'digital' | 'service_addon'
export type ProductStatus = 'active' | 'draft' | 'archived'

export interface ProductOption {
  id: string
  product_id: string
  name: string
  position: number
  values: string[]
}

export interface ProductVariant {
  id: string
  created_at: string
  product_id: string
  name: string
  sku: string | null
  barcode: string | null
  price_cents: number | null       // null = inherit from parent
  compare_at_price_cents: number | null
  cost_cents: number | null
  inventory_quantity: number | null
  option1_value: string | null
  option2_value: string | null
  option3_value: string | null
  image_url: string | null
  sort_order: number
}

export interface Product {
  id: string
  created_at: string
  updated_at: string
  business_id: string
  name: string
  description: string | null
  sku: string | null
  barcode: string | null
  category: string | null
  tags: string[]
  kind: ProductKind
  price_cents: number
  compare_at_price_cents: number | null
  cost_cents: number | null
  track_inventory: boolean
  inventory_quantity: number | null
  low_stock_threshold: number | null
  has_variants: boolean
  image_urls: string[]
  status: ProductStatus
  featured: boolean
  sort_order: number
  points_eligible: boolean
  points_override: number | null
}
```

No service layer or UI is in scope for this task — the table and types are the deliverable.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Migration applies cleanly: products, product_options, and product_variants tables exist with all columns, constraints, check constraints, and indexes as specified
- [ ] #2 RLS is enabled on all three tables with policies consistent with the existing tables
- [ ] #3 TypeScript types (Product, ProductVariant, ProductOption, ProductKind, ProductStatus) are added to src/types/index.ts
- [ ] #4 kind check constraint rejects values outside ('physical','digital','service_addon')
- [ ] #5 status check constraint rejects values outside ('active','draft','archived')
- [ ] #6 ON DELETE CASCADE is in place on product_options.product_id and product_variants.product_id so deleting a product cleans up its children
<!-- AC:END -->
