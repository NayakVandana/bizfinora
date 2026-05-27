import type { InvoiceStatus } from '@/invoices/types';

export function invoiceIsEditable(status: string): boolean {
    return status === 'draft' || status === 'sent';
}

export function invoiceCanReject(status: string): boolean {
    return status === 'draft' || status === 'sent';
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    rejected: 'Rejected',
};
