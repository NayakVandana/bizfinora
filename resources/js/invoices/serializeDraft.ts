import { APP_CURRENCY } from './currency';
import { stripCompanyDerivedFromFieldVisibility } from './companyContext';
import { readDiscountPercent, resolveDiscountForDraft } from './discount';
import type { InvoiceDraft } from './types';

/** Payload shape expected by company invoice store/update APIs. */
export function serializeInvoiceDraft(draft: InvoiceDraft): Record<string, unknown> {
    const discountPercent = readDiscountPercent(draft);
    const discount = resolveDiscountForDraft(draft);
    const qr = draft.qr_code_data ?? draft.document.qr_payload ?? '';
    const { payment: _payment, payment_terms: _pt, notes: _notes, ...documentRest } =
        draft.document;

    return {
        id: draft.id,
        buyer_id: draft.buyer_id ?? null,
        invoice_number: draft.invoice_number,
        invoice_number_label: draft.invoice_number_label ?? 'Invoice #',
        status: draft.status,
        invoice_date: draft.invoice_date,
        invoice_date_label: draft.invoice_date_label ?? 'Invoice date',
        due_date: draft.due_date || null,
        date_of_service: draft.date_of_service || null,
        currency: APP_CURRENCY,
        language: draft.language,
        date_format: draft.date_format ?? 'DD/MM/YYYY',
        template: draft.template,
        invoice_type: draft.invoice_type ?? 'standard',
        tax_type: draft.tax_type,
        tax_label: draft.tax_label,
        tax_rate: draft.tax_rate,
        tax_calculation_mode: draft.tax_calculation_mode ?? 'exclusive',
        tax_per_line: draft.tax_per_line ?? false,
        payment_method: draft.payment_method ?? null,
        header_notes: draft.header_notes ?? null,
        stripe_pay_url: draft.stripe_pay_url ?? null,
        qr_code_data: qr || null,
        qr_code_description: draft.qr_code_description ?? null,
        person_authorized_receive: null,
        person_authorized_issue: null,
        discount_type: 'percent',
        discount_value: discountPercent,
        discount_amount: discount,
        vat_summary_visible: draft.vat_summary_visible ?? true,
        field_visibility: stripCompanyDerivedFromFieldVisibility(
            draft.field_visibility,
        ),
        document: {
            ...documentRest,
            discount_type: 'percent',
            discount_value: discountPercent,
            discount_amount: discount,
            qr_payload: qr,
        },
    };
}
