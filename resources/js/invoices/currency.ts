/** Storefront invoices use Indian Rupees only. */
export const APP_CURRENCY = 'INR' as const;

export function normalizeCurrency(_value?: string | null): typeof APP_CURRENCY {
    return APP_CURRENCY;
}
