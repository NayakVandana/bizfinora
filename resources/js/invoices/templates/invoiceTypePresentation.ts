import { resolveInvoiceTypePresentation } from '../invoiceTypes';

export function documentTitleForDraft(invoiceType: string): string {
    return resolveInvoiceTypePresentation(invoiceType).title;
}

export function accentColorForDraft(invoiceType: string): string {
    return resolveInvoiceTypePresentation(invoiceType).accent;
}
