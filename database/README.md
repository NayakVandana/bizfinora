# Database schema

**One migration file = one `create_*_table`** per app table.  
Prefer all columns on the initial `create_` migration (no `add_*` patches). Use `add_*_to_*_table` only when a column truly cannot be created yet.

`foreignId()` columns store IDs only — **no database-level FK constraints** (`constrained()`). Relationships are handled in Laravel models / app logic.

## Create a new migration

Use the project helper (auto-numbered `2026_01_01_*`, stubs without `->constrained()`):

```bash
# New table
php artisan make:app-migration create_products_table

# Add column(s) to existing table
php artisan make:app-migration add_sku_to_products_table
```

Naming rules:

- **Create:** `create_{table}_table` → `Schema::create` + `dropIfExists` in `down()`
- **Alter:** `add_{something}_to_{table}_table` → `Schema::table` in `up()` / `down()`

Plain `php artisan make:migration` also uses stubs in `/stubs` (same style, timestamp filename).

README table is auto-generated from disk — run after edits:

```bash
php artisan app-migrations sync-readme
```

### Manage existing migrations

```bash
php artisan app-migrations list          # all 2026_01_01_* files + ran status
php artisan app-migrations check         # validate rules; offers README sync
php artisan app-migrations sync-readme   # rebuild table below from files
```

## Apply from scratch

```bash
php artisan migrate:fresh
```

**Warning:** drops all data. Required after renaming migration files.

---

## Order

### Laravel (`0001_01_01_*`)

| Migration | Table |
|-----------|--------|
| `000000_create_users_table` | `users` (address, city, state, postal_code, `current_company_id`) |
| `000001` … `000007` | cache, jobs, sessions, etc. |

### Bizfinora (`2026_01_01_*`)

<!-- APP_MIGRATIONS_START -->
| # | Migration file | `up()` | `down()` |
|---|----------------|--------|----------|
| 010 | `create_companies_table` | creates `companies` (incl. city, state, postal_code) | drops `companies` |
| 011 | `create_company_user_table` | creates `company_user` | drops `company_user` |
| 013 | `create_personal_access_tokens_table` | creates `personal_access_tokens` | drops `personal_access_tokens` |
| 020 | `create_buyers_table` | creates `buyers` | drops `buyers` |
| 021 | `create_invoices_table` | creates `invoices` | drops `invoices` |
| 022 | `create_invoice_line_items_table` | creates `invoice_line_items` | drops `invoice_line_items` |
| 030 | `create_invoice_templates_table` | creates `invoice_templates` | drops `invoice_templates` |
<!-- APP_MIGRATIONS_END -->

**Convention:** use `foreignId('other_table_id')` only — no `->constrained()`. Put reference columns on the initial `create_*` migration when possible.

---

## Table relationships

```
users ──┬── company_user ── companies
        └── current_company_id → companies

companies ── buyers, invoices, invoice_templates
invoices ── invoice_line_items
companies.default_custom_template_id → invoice_templates
```
