import type { CompanyTaxSettings } from './taxPresets';
import type { InvoiceDraft, PartyDetails } from './types';

export function emptyParty(): PartyDetails {
    return {
        name: '',
        email: '',
        phone: '',
        tax_id: '',
        tax_id_label: 'VAT no',
        address: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        account_number: '',
        swift_bic: '',
        notes: '',
    };
}

export function partyFromSeller(seller: PartyDetails): PartyDetails {
    return {
        ...emptyParty(),
        ...seller,
        name: seller.name || '',
        address:
            seller.address ||
            [seller.address_line1, seller.address_line2, seller.city, seller.country]
                .filter(Boolean)
                .join('\n'),
    };
}

export function buildDefaultDraft(
    seller: PartyDetails,
    invoiceNumber: string,
    logoDataUrl?: string | null,
    taxSettings?: CompanyTaxSettings | null,
): InvoiceDraft {
    const today = new Date().toISOString().slice(0, 10);
    const due = new Date();
    due.setDate(due.getDate() + 14);

    return {
        invoice_number: invoiceNumber,
        invoice_number_label: 'Invoice #',
        status: 'draft',
        issue_date: today,
        due_date: due.toISOString().slice(0, 10),
        date_of_service: today,
        currency: 'USD',
        language: 'en',
        date_format: 'YYYY-MM-DD',
        template: 'stripe',
        tax_type: taxSettings?.default_tax_type ?? 'vat',
        tax_label: taxSettings?.default_tax_label ?? 'VAT',
        tax_rate: taxSettings?.default_tax_rate ?? 0,
        tax_calculation_mode: taxSettings?.tax_calculation_mode ?? 'exclusive',
        tax_per_line: taxSettings?.tax_per_line ?? false,
        payment_method: '',
        header_notes: '',
        discount_amount: 0,
        vat_summary_visible: true,
        field_visibility: {
            seller_tax_id: true,
            seller_email: true,
            seller_phone: true,
            seller_bank: true,
            buyer_tax_id: true,
            buyer_email: true,
            buyer_phone: true,
        },
        document: {
            seller: partyFromSeller(seller),
            buyer: emptyParty(),
            items: [
                {
                    description: 'Service or product',
                    quantity: 1,
                    unit: 'pcs',
                    unit_price: 0,
                    tax_rate: taxSettings?.default_tax_rate ?? 0,
                },
            ],
            notes: '',
            payment_terms: 'Payment due within 14 days.',
            logo_data_url: logoDataUrl ?? null,
            qr_payload: '',
            discount_amount: 0,
        },
    };
}

export function invoicePayloadToDraft(data: Record<string, unknown>): InvoiceDraft {
    const document = (data.document as InvoiceDraft['document']) ?? {
        seller: emptyParty(),
        buyer: emptyParty(),
        items: [],
    };

    return {
        id: data.id as number | undefined,
        buyer_id: (data.buyer_id as number | null) ?? null,
        invoice_number: String(data.invoice_number ?? ''),
        invoice_number_label: String(data.invoice_number_label ?? 'Invoice #'),
        status: data.status as InvoiceDraft['status'],
        issue_date: String(data.issue_date ?? ''),
        due_date: String(data.due_date ?? ''),
        date_of_service: String(data.date_of_service ?? ''),
        currency: String(data.currency ?? 'USD'),
        language: String(data.language ?? 'en'),
        date_format: String(data.date_format ?? 'YYYY-MM-DD'),
        template: data.template as InvoiceDraft['template'],
        tax_type: data.tax_type as InvoiceDraft['tax_type'],
        tax_label: String(data.tax_label ?? 'Tax'),
        tax_rate: Number(data.tax_rate ?? 0),
        tax_calculation_mode:
            (data.tax_calculation_mode as InvoiceDraft['tax_calculation_mode']) ??
            'exclusive',
        tax_per_line: Boolean(data.tax_per_line ?? false),
        payment_method: String(data.payment_method ?? ''),
        header_notes: String(data.header_notes ?? ''),
        stripe_pay_url: String(data.stripe_pay_url ?? ''),
        qr_code_data: String(
            data.qr_code_data ?? document.qr_payload ?? '',
        ),
        qr_code_description: String(data.qr_code_description ?? ''),
        person_authorized_receive: String(
            data.person_authorized_receive ?? '',
        ),
        person_authorized_issue: String(data.person_authorized_issue ?? ''),
        discount_amount: Number(
            data.discount_amount ?? document.discount_amount ?? 0,
        ),
        vat_summary_visible: Boolean(data.vat_summary_visible ?? true),
        field_visibility:
            (data.field_visibility as InvoiceDraft['field_visibility']) ?? {},
        document: {
            ...document,
            discount_amount: Number(
                data.discount_amount ?? document.discount_amount ?? 0,
            ),
            qr_payload: String(
                data.qr_code_data ?? document.qr_payload ?? '',
            ),
        },
    };
}
