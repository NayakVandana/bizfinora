import { APP_CURRENCY } from './currency';
import type { InvoiceDraft } from './types';

/** Payload shape expected by company invoice store/update APIs. */
export function serializeInvoiceDraft(draft: InvoiceDraft): Record<string, unknown> {
    const discount =
        draft.discount_amount ?? draft.document.discount_amount ?? 0;
    const qr = draft.qr_code_data ?? draft.document.qr_payload ?? '';

    return {
        id: draft.id,
        buyer_id: draft.buyer_id ?? null,
        invoice_number: draft.invoice_number,
        invoice_number_label: draft.invoice_number_label ?? 'Invoice #',
        status: draft.status,
        issue_date: draft.issue_date,
        due_date: draft.due_date || null,
        date_of_service: draft.date_of_service || null,
        currency: APP_CURRENCY,
        language: draft.language,
        date_format: draft.date_format ?? 'YYYY-MM-DD',
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
        person_authorized_receive: draft.person_authorized_receive ?? null,
        person_authorized_issue: draft.person_authorized_issue ?? null,
        discount_amount: discount,
        vat_summary_visible: draft.vat_summary_visible ?? true,
        field_visibility: draft.field_visibility ?? {},
        document: {
            ...draft.document,
            discount_amount: discount,
            qr_payload: qr,
        },
    };
}
