/** Format YYYY-MM-DD for display on invoice PDFs. */
export function formatInvoiceDate(
    isoDate: string | undefined | null,
    dateFormat?: string,
): string {
    if (!isoDate?.trim()) {
        return '';
    }

    const parts = isoDate.trim().split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return isoDate;
    }

    const [y, m, d] = parts;
    const dd = String(d).padStart(2, '0');
    const mm = String(m).padStart(2, '0');

    switch (dateFormat) {
        case 'DD/MM/YYYY':
            return `${dd}/${mm}/${y}`;
        case 'MM/DD/YYYY':
            return `${mm}/${dd}/${y}`;
        default:
            return isoDate;
    }
}

export function invoiceDateDisplay(
    date: string | undefined | null,
    label: string | undefined | null,
    dateFormat?: string,
): string {
    const formatted = formatInvoiceDate(date, dateFormat);
    if (!formatted) {
        return '';
    }
    const caption = (label ?? 'Invoice date').trim();
    return `${caption}: ${formatted}`;
}
