import type { InvoiceStatus } from '@/invoices/types';

export function invoiceIsEditable(status: string): boolean {
    return status === 'draft' || status === 'sent' || status === 'unpaid';
}

export function invoiceCanReject(status: string): boolean {
    return status === 'draft' || status === 'sent' || status === 'unpaid';
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    unpaid: 'Unpaid',
    paid: 'Paid',
    rejected: 'Rejected',
};
