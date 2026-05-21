export function formatMoney(amount: number, currency: string, locale = 'en'): string {
    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency || 'USD',
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
}
