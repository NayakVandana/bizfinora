/** Default label for the date shown on the invoice (per invoice type). */
export function defaultInvoiceDateLabel(invoiceType: string): string {
    switch (invoiceType) {
        case 'pro_forma':
            return 'Pro forma date';
        case 'tax':
        case 'gst':
            return 'Tax invoice date';
        case 'credit_memo':
            return 'Credit note date';
        case 'debit_memo':
            return 'Debit note date';
        case 'receipt':
            return 'Receipt date';
        case 'bill_of_supply':
            return 'Bill date';
        case 'commercial':
        case 'export':
        case 'import':
            return 'Invoice date';
        default:
            return 'Invoice date';
    }
}
