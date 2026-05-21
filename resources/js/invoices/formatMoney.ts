import { APP_CURRENCY, normalizeCurrency } from './currency';

/**
 * Indian locale grouping (e.g. 1,23,456.78) with Rs. prefix for PDF/browser consistency.
 */
export function formatMoney(amount: number, _currency?: string): string {
    const value = Number.isFinite(amount) ? amount : 0;

    try {
        const formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

        return `Rs. ${formatted}`;
    } catch {
        return `Rs. ${value.toFixed(2)}`;
    }
}

export function formatMoneyIntl(amount: number): string {
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: APP_CURRENCY,
        }).format(amount);
    } catch {
        return formatMoney(amount);
    }
}

