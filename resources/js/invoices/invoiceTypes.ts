import { APP_CURRENCY } from './currency';
import { formatForInvoiceType } from './invoiceFormatConfig';
import type { InvoiceDraft, InvoiceTemplate, TaxType } from './types';

function layoutFromFormat(format: ReturnType<typeof formatForInvoiceType>): InvoiceTemplate {
    return format === 'classic' || format === 'tax' || format === 'trade'
        ? 'classic'
        : 'stripe';
}

export type InvoiceTypeId =
    | 'standard'
    | 'pro_forma'
    | 'commercial'
    | 'tax'
    | 'sales'
    | 'purchase'
    | 'recurring'
    | 'credit_memo'
    | 'debit_memo'
    | 'interim'
    | 'final'
    | 'past_due'
    | 'timesheet'
    | 'retainer'
    | 'self_billing'
    | 'e_invoice'
    | 'expense'
    | 'mixed'
    | 'consignment'
    | 'export'
    | 'import'
    | 'freelance'
    | 'service'
    | 'rental'
    | 'progress'
    | 'digital'
    | 'gst'
    | 'bill_of_supply'
    | 'revised'
    | 'receipt';

export type InvoiceTypeOption = {
    id: InvoiceTypeId;
    label: string;
    description: string;
    category: string;
    category_label: string;
    layout: InvoiceTemplate;
    title: string;
    number_label: string;
    accent?: string | null;
    header_note?: string | null;
    tax_type?: TaxType | null;
    tax_label?: string | null;
};

export const INVOICE_TYPE_CATEGORIES: Record<string, string> = {
    general: 'General',
    tax_compliance: 'Tax & compliance',
    trade: 'International trade',
    billing: 'Billing cycles',
    adjustments: 'Adjustments',
    collections: 'Collections',
    specialized: 'Specialized',
};

export const INVOICE_TYPES: InvoiceTypeOption[] = [
    {
        id: 'standard',
        label: 'Standard Invoice',
        description: 'Regular bill issued for products or services.',
        category: 'general',
        category_label: 'General',
        layout: 'stripe',
        title: 'INVOICE',
        number_label: 'Invoice #',
    },
    {
        id: 'pro_forma',
        label: 'Pro Forma Invoice',
        description: 'Preliminary invoice sent before delivery or payment.',
        category: 'general',
        category_label: 'General',
        layout: 'stripe',
        title: 'PRO FORMA INVOICE',
        number_label: 'Pro forma #',
        header_note: 'This is not a tax invoice until confirmed.',
    },
    {
        id: 'sales',
        label: 'Sales Invoice',
        description: 'Issued after a sale is completed.',
        category: 'general',
        category_label: 'General',
        layout: 'stripe',
        title: 'SALES INVOICE',
        number_label: 'Sales invoice #',
    },
    {
        id: 'purchase',
        label: 'Purchase Invoice',
        description: 'Received by the buyer from a supplier.',
        category: 'general',
        category_label: 'General',
        layout: 'classic',
        title: 'PURCHASE INVOICE',
        number_label: 'Purchase #',
    },
    {
        id: 'e_invoice',
        label: 'E-Invoice',
        description: 'Electronically generated invoice.',
        category: 'general',
        category_label: 'General',
        layout: 'stripe',
        title: 'E-INVOICE',
        number_label: 'E-invoice #',
    },
    {
        id: 'digital',
        label: 'Digital Invoice',
        description: 'Shared via email or software in digital format.',
        category: 'general',
        category_label: 'General',
        layout: 'stripe',
        title: 'DIGITAL INVOICE',
        number_label: 'Invoice #',
    },
    {
        id: 'receipt',
        label: 'Receipt Invoice',
        description: 'Confirms payment received.',
        category: 'general',
        category_label: 'General',
        layout: 'stripe',
        title: 'RECEIPT',
        number_label: 'Receipt #',
        header_note: 'Payment received — thank you.',
    },
    {
        id: 'tax',
        label: 'Tax Invoice',
        description: 'Includes GST, VAT, or other tax details.',
        category: 'tax_compliance',
        category_label: 'Tax & compliance',
        layout: 'classic',
        title: 'TAX INVOICE',
        number_label: 'Tax invoice #',
        tax_type: 'vat',
    },
    {
        id: 'gst',
        label: 'GST Invoice (India)',
        description: 'GST-compliant invoice with HSN/SAC codes.',
        category: 'tax_compliance',
        category_label: 'Tax & compliance',
        layout: 'classic',
        title: 'GST INVOICE',
        number_label: 'GST invoice #',
        tax_type: 'gst',
        tax_label: 'GST',
        header_note: 'Include HSN/SAC codes on line items where applicable.',
    },
    {
        id: 'bill_of_supply',
        label: 'Bill of Supply (India GST)',
        description: 'For composition dealers or non-taxable goods.',
        category: 'tax_compliance',
        category_label: 'Tax & compliance',
        layout: 'classic',
        title: 'BILL OF SUPPLY',
        number_label: 'Bill of supply #',
        tax_type: 'none',
    },
    {
        id: 'mixed',
        label: 'Mixed Invoice',
        description: 'Contains taxable and non-taxable items.',
        category: 'tax_compliance',
        category_label: 'Tax & compliance',
        layout: 'classic',
        title: 'MIXED TAX INVOICE',
        number_label: 'Invoice #',
    },
    {
        id: 'self_billing',
        label: 'Self-Billing Invoice',
        description: 'Buyer creates invoice on behalf of supplier.',
        category: 'tax_compliance',
        category_label: 'Tax & compliance',
        layout: 'classic',
        title: 'SELF-BILLING INVOICE',
        number_label: 'Self-billing #',
    },
    {
        id: 'commercial',
        label: 'Commercial Invoice',
        description: 'Used in international trade and customs.',
        category: 'trade',
        category_label: 'International trade',
        layout: 'classic',
        title: 'COMMERCIAL INVOICE',
        number_label: 'Commercial invoice #',
    },
    {
        id: 'export',
        label: 'Export Invoice',
        description: 'For goods exported internationally.',
        category: 'trade',
        category_label: 'International trade',
        layout: 'classic',
        title: 'EXPORT INVOICE',
        number_label: 'Export invoice #',
    },
    {
        id: 'import',
        label: 'Import Invoice',
        description: 'For imported goods.',
        category: 'trade',
        category_label: 'International trade',
        layout: 'classic',
        title: 'IMPORT INVOICE',
        number_label: 'Import invoice #',
    },
    {
        id: 'consignment',
        label: 'Consignment Invoice',
        description: 'Used for consignment goods.',
        category: 'trade',
        category_label: 'International trade',
        layout: 'classic',
        title: 'CONSIGNMENT INVOICE',
        number_label: 'Consignment #',
    },
    {
        id: 'recurring',
        label: 'Recurring Invoice',
        description: 'Generated repeatedly for subscriptions or services.',
        category: 'billing',
        category_label: 'Billing cycles',
        layout: 'stripe',
        title: 'RECURRING INVOICE',
        number_label: 'Billing period #',
    },
    {
        id: 'interim',
        label: 'Interim Invoice',
        description: 'Partial billing for project milestones.',
        category: 'billing',
        category_label: 'Billing cycles',
        layout: 'stripe',
        title: 'INTERIM INVOICE',
        number_label: 'Interim #',
    },
    {
        id: 'final',
        label: 'Final Invoice',
        description: 'Last invoice after project completion.',
        category: 'billing',
        category_label: 'Billing cycles',
        layout: 'classic',
        title: 'FINAL INVOICE',
        number_label: 'Final invoice #',
    },
    {
        id: 'retainer',
        label: 'Retainer Invoice',
        description: 'Advance payment before work starts.',
        category: 'billing',
        category_label: 'Billing cycles',
        layout: 'stripe',
        title: 'RETAINER INVOICE',
        number_label: 'Retainer #',
    },
    {
        id: 'progress',
        label: 'Progress Invoice',
        description: 'Billing according to work progress.',
        category: 'billing',
        category_label: 'Billing cycles',
        layout: 'stripe',
        title: 'PROGRESS INVOICE',
        number_label: 'Progress #',
    },
    {
        id: 'credit_memo',
        label: 'Credit Invoice (Credit Memo)',
        description: 'Reduces amount due or records a refund adjustment.',
        category: 'adjustments',
        category_label: 'Adjustments',
        layout: 'stripe',
        title: 'CREDIT MEMO',
        number_label: 'Credit note #',
        accent: '#059669',
    },
    {
        id: 'debit_memo',
        label: 'Debit Invoice (Debit Memo)',
        description: 'Additional amount charged to the customer.',
        category: 'adjustments',
        category_label: 'Adjustments',
        layout: 'stripe',
        title: 'DEBIT MEMO',
        number_label: 'Debit note #',
        accent: '#dc2626',
    },
    {
        id: 'revised',
        label: 'Revised Invoice',
        description: 'Corrected invoice replacing a previous one.',
        category: 'adjustments',
        category_label: 'Adjustments',
        layout: 'classic',
        title: 'REVISED INVOICE',
        number_label: 'Revised #',
        header_note: 'This invoice supersedes the previous version.',
    },
    {
        id: 'past_due',
        label: 'Past Due Invoice',
        description: 'Reminder for overdue payment.',
        category: 'collections',
        category_label: 'Collections',
        layout: 'stripe',
        title: 'PAST DUE INVOICE',
        number_label: 'Invoice #',
        accent: '#dc2626',
        header_note: 'Payment is overdue. Please remit immediately.',
    },
    {
        id: 'timesheet',
        label: 'Timesheet Invoice',
        description: 'Based on hours worked.',
        category: 'specialized',
        category_label: 'Specialized',
        layout: 'stripe',
        title: 'TIMESHEET INVOICE',
        number_label: 'Timesheet #',
    },
    {
        id: 'expense',
        label: 'Expense Invoice',
        description: 'Includes reimbursable expenses.',
        category: 'specialized',
        category_label: 'Specialized',
        layout: 'stripe',
        title: 'EXPENSE INVOICE',
        number_label: 'Expense report #',
    },
    {
        id: 'freelance',
        label: 'Freelance Invoice',
        description: 'Used by freelancers and consultants.',
        category: 'specialized',
        category_label: 'Specialized',
        layout: 'stripe',
        title: 'FREELANCE INVOICE',
        number_label: 'Invoice #',
    },
    {
        id: 'service',
        label: 'Service Invoice',
        description: 'For service-based businesses.',
        category: 'specialized',
        category_label: 'Specialized',
        layout: 'stripe',
        title: 'SERVICE INVOICE',
        number_label: 'Service #',
    },
    {
        id: 'rental',
        label: 'Rental Invoice',
        description: 'For rent or lease payments.',
        category: 'specialized',
        category_label: 'Specialized',
        layout: 'stripe',
        title: 'RENTAL INVOICE',
        number_label: 'Rental #',
    },
];

const typeMap = new Map(INVOICE_TYPES.map((t) => [t.id, t]));

export function getInvoiceType(id: string): InvoiceTypeOption | undefined {
    return typeMap.get(id as InvoiceTypeId);
}

export function invoiceTypeLabel(id: string): string {
    return getInvoiceType(id)?.label ?? id;
}

export function groupInvoiceTypesByCategory(
    types: InvoiceTypeOption[] = INVOICE_TYPES,
): { category: string; category_label: string; types: InvoiceTypeOption[] }[] {
    const order = Object.keys(INVOICE_TYPE_CATEGORIES);
    const grouped = new Map<string, InvoiceTypeOption[]>();

    for (const type of types) {
        const list = grouped.get(type.category) ?? [];
        list.push(type);
        grouped.set(type.category, list);
    }

    return order
        .filter((cat) => grouped.has(cat))
        .map((cat) => ({
            category: cat,
            category_label: INVOICE_TYPE_CATEGORIES[cat] ?? cat,
            types: grouped.get(cat) ?? [],
        }));
}

export function applyInvoiceTypeToDraft(
    draft: InvoiceDraft,
    typeId: string,
): Partial<InvoiceDraft> {
    const meta = getInvoiceType(typeId);
    if (!meta) {
        return { invoice_type: typeId };
    }

    const patch: Partial<InvoiceDraft> = {
        invoice_type: meta.id,
        template: layoutFromFormat(formatForInvoiceType(meta.id)),
        invoice_number_label: meta.number_label,
        currency: APP_CURRENCY,
    };

    if (meta.header_note) {
        patch.header_notes = meta.header_note;
    }
    if (meta.tax_type) {
        patch.tax_type = meta.tax_type;
        if (meta.tax_type === 'none') {
            patch.tax_rate = 0;
        }
    }
    if (meta.tax_label) {
        patch.tax_label = meta.tax_label;
    }

    return patch;
}

export function resolveInvoiceTypePresentation(invoiceType: string): {
    title: string;
    accent: string;
    subtitle?: string;
} {
    const meta = getInvoiceType(invoiceType);

    return {
        title: meta?.title ?? 'INVOICE',
        accent: meta?.accent ?? '#fbbf24',
        subtitle: meta?.description,
    };
}
