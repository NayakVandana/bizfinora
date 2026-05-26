/** Mirrors App\Support\PaymentTerms::forType */
export function paymentTermsForType(typeId: string): string {
    switch (typeId) {
        case 'retainer':
            return 'Advance payment before work begins.';
        case 'past_due':
            return 'Overdue — please pay immediately.';
        case 'receipt':
            return 'Payment received. Thank you.';
        case 'commercial':
        case 'export':
        case 'import':
            return 'Payment within 30 days of invoice date.';
        default:
            return 'Payment due within 14 days.';
    }
}

export type PaymentTermsPreset = {
    id: string;
    label: string;
    text: string;
    invoice_types?: string[];
};

export const PAYMENT_TERMS_PRESETS: PaymentTermsPreset[] = [
    {
        id: 'net14',
        label: 'Net 14 days',
        text: 'Payment due within 14 days.',
    },
    {
        id: 'net30',
        label: 'Net 30 days',
        text: 'Payment within 30 days of invoice date.',
        invoice_types: ['commercial', 'export', 'import'],
    },
    {
        id: 'retainer',
        label: 'Retainer',
        text: 'Advance payment before work begins.',
        invoice_types: ['retainer'],
    },
    {
        id: 'past_due',
        label: 'Past due',
        text: 'Overdue — please pay immediately.',
        invoice_types: ['past_due'],
    },
    {
        id: 'receipt',
        label: 'Receipt / paid',
        text: 'Payment received. Thank you.',
        invoice_types: ['receipt'],
    },
];

export function resolveDefaultPaymentTerms(
    companyTerms: string | null | undefined,
    invoiceTypeId: string,
): string {
    const trimmed = companyTerms?.trim() ?? '';

    if (trimmed !== '') {
        return trimmed;
    }

    return paymentTermsForType(invoiceTypeId);
}

export function presetForInvoiceType(
    typeId: string,
): PaymentTermsPreset | undefined {
    return PAYMENT_TERMS_PRESETS.find(
        (p) => p.invoice_types?.includes(typeId) ?? p.id === 'net14',
    );
}
