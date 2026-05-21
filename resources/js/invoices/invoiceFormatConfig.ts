import { getInvoiceType } from './invoiceTypes';
import type { InvoiceDraft } from './types';

export type InvoiceFormatId =
    | 'modern'
    | 'classic'
    | 'tax'
    | 'trade'
    | 'timesheet'
    | 'memo'
    | 'receipt';

export type TableColumnKey =
    | 'description'
    | 'hsn'
    | 'qty'
    | 'unit'
    | 'rate'
    | 'tax'
    | 'amount'
    | 'hours';

export type InvoiceFormatConfig = {
    format: InvoiceFormatId;
    title: string;
    accent: string;
    numberLabel: string;
    sellerLabel: string;
    buyerLabel: string;
    totalLabel: string;
    amountHeaderLabel: string;
    columns: TableColumnKey[];
    showTaxIdRow: boolean;
    showTradeMeta: boolean;
    showPeriod: boolean;
    showStatusBanner: boolean;
    bannerText?: string;
    footerDeclaration?: string;
    headerNote?: string;
};

const FORMAT_BY_TYPE: Record<string, InvoiceFormatId> = {
    standard: 'modern',
    pro_forma: 'modern',
    sales: 'modern',
    purchase: 'classic',
    recurring: 'modern',
    credit_memo: 'memo',
    debit_memo: 'memo',
    interim: 'modern',
    final: 'classic',
    past_due: 'memo',
    timesheet: 'timesheet',
    retainer: 'modern',
    self_billing: 'tax',
    e_invoice: 'modern',
    expense: 'modern',
    mixed: 'tax',
    consignment: 'trade',
    export: 'trade',
    import: 'trade',
    commercial: 'trade',
    freelance: 'modern',
    service: 'modern',
    rental: 'modern',
    progress: 'modern',
    digital: 'modern',
    gst: 'tax',
    bill_of_supply: 'tax',
    revised: 'memo',
    receipt: 'receipt',
    tax: 'tax',
};

export function formatForInvoiceType(typeId: string): InvoiceFormatId {
    return FORMAT_BY_TYPE[typeId] ?? 'modern';
}

function columnsForFormat(
    format: InvoiceFormatId,
    typeId: string,
): TableColumnKey[] {
    if (format === 'timesheet') {
        return ['description', 'hours', 'rate', 'amount'];
    }
    if (format === 'tax' && typeId === 'gst') {
        return ['description', 'hsn', 'qty', 'rate', 'tax', 'amount'];
    }
    if (format === 'tax') {
        return ['description', 'qty', 'rate', 'tax', 'amount'];
    }
    if (format === 'trade') {
        return ['description', 'qty', 'unit', 'rate', 'amount'];
    }

    return ['description', 'qty', 'rate', 'amount'];
}

export function buildFormatConfig(draft: InvoiceDraft): InvoiceFormatConfig {
    const typeId = draft.invoice_type ?? 'standard';
    const meta = getInvoiceType(typeId);
    const format = formatForInvoiceType(typeId);
    const title = meta?.title ?? 'INVOICE';
    const accent = meta?.accent ?? '#fbbf24';

    const base: InvoiceFormatConfig = {
        format,
        title,
        accent,
        numberLabel: draft.invoice_number_label ?? meta?.number_label ?? 'Invoice #',
        sellerLabel: 'From',
        buyerLabel: 'Bill to',
        totalLabel: 'Total',
        amountHeaderLabel: 'Total',
        columns: columnsForFormat(format, typeId),
        showTaxIdRow: format === 'tax',
        showTradeMeta: format === 'trade',
        showPeriod: format === 'timesheet',
        showStatusBanner: false,
        headerNote: draft.header_notes || meta?.header_note || undefined,
    };

    if (format === 'trade') {
        return {
            ...base,
            sellerLabel: 'Exporter / Seller',
            buyerLabel: 'Consignee / Buyer',
            footerDeclaration:
                'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
        };
    }

    if (format === 'tax' && typeId === 'gst') {
        return {
            ...base,
            footerDeclaration:
                'Tax payable under reverse charge: No. HSN/SAC as applicable.',
        };
    }

    if (format === 'tax') {
        return {
            ...base,
            showTaxIdRow: true,
            footerDeclaration: `${draft.tax_label} details as shown above.`,
        };
    }

    if (format === 'timesheet') {
        return {
            ...base,
            sellerLabel: 'Contractor',
            buyerLabel: 'Client',
            showPeriod: true,
        };
    }

    if (typeId === 'credit_memo') {
        return {
            ...base,
            totalLabel: 'Credit amount',
            amountHeaderLabel: 'Credit amount',
            showStatusBanner: true,
            bannerText: 'CREDIT — reduces balance owed',
        };
    }

    if (typeId === 'debit_memo') {
        return {
            ...base,
            totalLabel: 'Additional charge',
            amountHeaderLabel: 'Debit amount',
            showStatusBanner: true,
            bannerText: 'DEBIT — additional amount due',
        };
    }

    if (typeId === 'past_due') {
        return {
            ...base,
            totalLabel: 'Overdue balance',
            amountHeaderLabel: 'Overdue amount',
            showStatusBanner: true,
            bannerText: 'PAYMENT OVERDUE — please pay immediately',
        };
    }

    if (typeId === 'revised') {
        return {
            ...base,
            showStatusBanner: true,
            bannerText: 'REVISED — supersedes previous invoice',
        };
    }

    if (format === 'receipt') {
        return {
            ...base,
            totalLabel: 'Amount received',
            amountHeaderLabel: 'Paid',
            showStatusBanner: true,
            bannerText: 'PAYMENT RECEIVED',
        };
    }

    if (typeId === 'pro_forma') {
        return {
            ...base,
            totalLabel: 'Estimated total',
            amountHeaderLabel: 'Estimated total',
        };
    }

    if (typeId === 'bill_of_supply') {
        return {
            ...base,
            footerDeclaration: 'Composition scheme / non-taxable supply as applicable.',
        };
    }

    return base;
}
