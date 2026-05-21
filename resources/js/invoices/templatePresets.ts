import type { InvoiceTemplate } from './types';

export const INVOICE_TEMPLATES: { id: InvoiceTemplate; label: string }[] = [
    { id: 'stripe', label: 'Modern (Stripe-style)' },
    { id: 'classic', label: 'Classic' },
];

export function templateLabel(id: InvoiceTemplate): string {
    return INVOICE_TEMPLATES.find((t) => t.id === id)?.label ?? id;
}
