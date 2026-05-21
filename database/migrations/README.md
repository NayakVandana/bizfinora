# Migrations (fresh install only)

Use **`php artisan migrate:fresh --seed`** — no separate `add_*` migration files.

## Run order

| File | Creates |
|------|---------|
| `0001_01_01_000000_create_users_table` | `users` (+ `is_admin`) |
| `0001_01_01_000001_create_password_reset_tokens_table` | `password_reset_tokens` |
| `0001_01_01_000002_create_sessions_table` | `sessions` |
| `0001_01_01_000003_create_cache_table` | `cache` |
| `0001_01_01_000004_create_cache_locks_table` | `cache_locks` |
| `0001_01_01_000005_create_jobs_table` | `jobs` |
| `0001_01_01_000006_create_job_batches_table` | `job_batches` |
| `0001_01_01_000007_create_failed_jobs_table` | `failed_jobs` |
| `2026_05_20_000001_create_companies_table` | `companies` (incl. default tax settings) |
| `2026_05_20_000002_create_company_user_table` | `users.current_company_id` + `company_user` |
| `2026_05_20_000003_create_personal_access_tokens_table` | `personal_access_tokens` |
| `2026_05_20_100000_create_buyers_table` | `buyers` |
| `2026_05_20_100001_create_invoices_table` | `invoices` (incl. tax mode / per-line flag) |
| `2026_05_20_100002_create_invoice_line_items_table` | `invoice_line_items` (incl. line `tax_rate`) |

`000002_create_company_user_table` adds `users.current_company_id` after `companies` exists, then creates the pivot table.

```bash
php artisan migrate:fresh --seed
```
