export type InvoiceStatusSummarySlice = {
    count: number;
    amount: number;
};

export type InvoiceSummary = {
    total: number;
    all: InvoiceStatusSummarySlice;
    draft: InvoiceStatusSummarySlice;
    sent: InvoiceStatusSummarySlice;
    unpaid: InvoiceStatusSummarySlice;
    paid: InvoiceStatusSummarySlice;
    rejected: InvoiceStatusSummarySlice;
};

export type InvoiceStatusFilter =
    | 'all'
    | 'draft'
    | 'sent'
    | 'unpaid'
    | 'paid'
    | 'rejected';

export type PaginatedWithInvoiceSummary<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    summary: InvoiceSummary;
};
