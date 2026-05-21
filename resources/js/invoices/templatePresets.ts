import { applyInvoiceTypeToDraft } from './invoiceTypes';
import type { InvoiceTemplate } from './types';
import type {
    FieldVisibility,
    InvoiceDraft,
    InvoiceLineItem,
    TaxCalculationMode,
    TaxType,
} from './types';

export const INVOICE_TEMPLATES: {
    id: InvoiceTemplate;
    label: string;
}[] = [
    { id: 'stripe', label: 'Modern (Stripe-style)' },
    { id: 'classic', label: 'Classic' },
];

export type TemplatePreset = {
    invoice_number_label?: string;
    invoice_date_label?: string;
    invoice_type?: string;
    template?: InvoiceTemplate;
    tax_type?: TaxType;
    tax_label?: string;
    tax_rate?: number;
    tax_calculation_mode?: TaxCalculationMode;
    tax_per_line?: boolean;
    header_notes?: string;
    payment_terms?: string;
    language?: string;
    date_format?: string;
    vat_summary_visible?: boolean;
    field_visibility?: FieldVisibility;
    default_items?: InvoiceLineItem[];
    document_notes?: string;
};

export function draftToTemplatePreset(draft: InvoiceDraft): TemplatePreset {
    return {
        invoice_number_label: draft.invoice_number_label,
        invoice_date_label: draft.invoice_date_label,
        invoice_type: draft.invoice_type,
        template: draft.template,
        tax_type: draft.tax_type,
        tax_label: draft.tax_label,
        tax_rate: draft.tax_rate,
        tax_calculation_mode: draft.tax_calculation_mode,
        tax_per_line: draft.tax_per_line,
        header_notes: draft.header_notes,
        payment_terms: draft.document.payment_terms,
        language: draft.language,
        date_format: draft.date_format,
        vat_summary_visible: draft.vat_summary_visible,
        field_visibility: draft.field_visibility,
        default_items: draft.document.items,
        document_notes: draft.document.notes,
    };
}

export function applyTemplatePresetToDraft(
    draft: InvoiceDraft,
    preset: TemplatePreset,
): InvoiceDraft {
    const typeId = preset.invoice_type ?? draft.invoice_type ?? 'standard';
    const typePatch = applyInvoiceTypeToDraft(draft, typeId);

    const items =
        preset.default_items && preset.default_items.length > 0
            ? preset.default_items
            : draft.document.items;

    return {
        ...draft,
        ...typePatch,
        invoice_type: typeId,
        invoice_number_label:
            preset.invoice_number_label ??
            typePatch.invoice_number_label ??
            draft.invoice_number_label,
        invoice_date_label:
            preset.invoice_date_label ??
            typePatch.invoice_date_label ??
            draft.invoice_date_label,
        template:
            preset.template ??
            (typePatch.template as InvoiceTemplate | undefined) ??
            draft.template,
        tax_type: preset.tax_type ?? typePatch.tax_type ?? draft.tax_type,
        tax_label: preset.tax_label ?? typePatch.tax_label ?? draft.tax_label,
        tax_rate:
            preset.tax_rate !== undefined
                ? preset.tax_rate
                : (typePatch.tax_rate ?? draft.tax_rate),
        tax_calculation_mode:
            preset.tax_calculation_mode ?? draft.tax_calculation_mode,
        tax_per_line: preset.tax_per_line ?? draft.tax_per_line,
        header_notes: preset.header_notes ?? typePatch.header_notes ?? draft.header_notes,
        language: preset.language ?? draft.language,
        date_format: preset.date_format ?? draft.date_format,
        vat_summary_visible:
            preset.vat_summary_visible ?? draft.vat_summary_visible,
        field_visibility: {
            ...draft.field_visibility,
            ...preset.field_visibility,
        },
        document: {
            ...draft.document,
            items,
            payment_terms:
                preset.payment_terms ?? draft.document.payment_terms,
            notes: preset.document_notes ?? draft.document.notes,
        },
    };
}
