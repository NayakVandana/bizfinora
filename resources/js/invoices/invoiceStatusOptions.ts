import type { InvoiceStatus } from '@/invoices/types';
import { INVOICE_STATUS_LABELS } from '@/invoices/invoiceActions';

/** Statuses selectable from invoice listing (reject uses separate action). */
export const LISTING_STATUS_VALUES: InvoiceStatus[] = [
    'draft',
    'sent',
    'unpaid',
    'paid',
];

export function invoiceCanUpdateStatus(status: string): boolean {
    return status !== 'paid' && status !== 'rejected';
}

export function listingStatusLabel(status: InvoiceStatus): string {
    return INVOICE_STATUS_LABELS[status];
}
