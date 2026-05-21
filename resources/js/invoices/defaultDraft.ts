import { APP_CURRENCY, normalizeCurrency } from './currency';
import { defaultInvoiceDateLabel } from './invoiceDateLabels';
import { applyInvoiceTypeToDraft } from './invoiceTypes';
import type { CompanyTaxSettings } from './taxPresets';
import type { InvoiceDraft, InvoiceTemplate, PartyDetails } from './types';

/** YYYY-MM-DD in local timezone (for HTML date inputs). */
export function localDateString(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function addDaysLocal(base: Date, days: number): string {
    const next = new Date(base);
    next.setDate(next.getDate() + days);
    return localDateString(next);
}

/** Only invoice date defaults to today; other dates stay empty until the user sets them. */
export function ensureDefaultInvoiceDates(draft: InvoiceDraft): InvoiceDraft {
    const today = localDateString();

    return {
        ...draft,
        invoice_date: draft.invoice_date?.trim() || today,
    };
}

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
    template: InvoiceTemplate = 'stripe',
    invoiceType: string = 'standard',
): InvoiceDraft {
    const today = localDateString();

    const base: InvoiceDraft = {
        invoice_number: invoiceNumber,
        invoice_number_label: 'Invoice #',
        status: 'draft',
        invoice_date: today,
        invoice_date_label: defaultInvoiceDateLabel(invoiceType),
        due_date: '',
        date_of_service: '',
        currency: APP_CURRENCY,
        language: 'en',
        date_format: 'DD/MM/YYYY',
        template,
        invoice_type: invoiceType,
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
            seller_address: true,
            seller_tax_id: true,
            seller_email: true,
            seller_phone: true,
            seller_bank: true,
            seller_logo: true,
            seller_notes: false,
            buyer_address: true,
            buyer_owner_name: true,
            buyer_gst: true,
            buyer_pan: true,
            buyer_tax_id: true,
            buyer_email: true,
            buyer_phone: true,
            buyer_bank: true,
            buyer_notes: false,
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

    return { ...base, ...applyInvoiceTypeToDraft(base, invoiceType) };
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
        invoice_date: String(
            data.invoice_date ?? data.issue_date ?? '',
        ),
        invoice_date_label: String(
            data.invoice_date_label ?? 'Invoice date',
        ),
        due_date: String(data.due_date ?? ''),
        date_of_service: String(data.date_of_service ?? ''),
        currency: normalizeCurrency(
            data.currency as string | undefined,
        ),
        language: String(data.language ?? 'en'),
        date_format: String(data.date_format ?? 'DD/MM/YYYY'),
        template: data.template as InvoiceDraft['template'],
        invoice_type: String(data.invoice_type ?? 'standard'),
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
