import type { InvoiceStatus } from '@/invoices/types';

export type InvoiceStatusBadgeVariant = {
    label: string;
    badge: string;
};

const base = 'inline-block rounded px-2 py-0.5 text-xs font-medium';

const variants: Record<InvoiceStatus, InvoiceStatusBadgeVariant> = {
    draft: {
        label: 'Draft',
        badge: `${base} bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300`,
    },
    sent: {
        label: 'Sent',
        badge: `${base} bg-accent text-accent-foreground`,
    },
    paid: {
        label: 'Paid',
        badge: `${base} bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300`,
    },
    rejected: {
        label: 'Rejected',
        badge: `${base} bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300`,
    },
};

const fallback: InvoiceStatusBadgeVariant = {
    label: 'Unknown',
    badge: `${base} bg-muted text-muted-foreground`,
};

export function invoiceStatusBadgeVariant(
    status: string,
): InvoiceStatusBadgeVariant {
    if (status in variants) {
        return variants[status as InvoiceStatus];
    }

    return {
        ...fallback,
        label: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    };
}

/** @deprecated Use InvoiceStatusBadge or invoiceStatusBadgeVariant */
export function statusBadgeClass(status: string): string {
    return invoiceStatusBadgeVariant(status).badge;
}
