import type { InvoicePaymentDetails } from './types';

export type { InvoicePaymentDetails };

export const PAYMENT_VISIBILITY_BANK = 'payment_bank_details';
export const PAYMENT_VISIBILITY_QR = 'payment_qr';
export const PAYMENT_VISIBILITY_TERMS = 'payment_terms';

export type PaymentTermsPresetOption = {
    id: string;
    label: string;
    text: string;
    invoice_types?: string[];
};

export type CompanyPaymentSettings = InvoicePaymentDetails & {
    payment_note?: string | null;
    default_payment_terms?: string | null;
    payment_terms_presets?: PaymentTermsPresetOption[];
    default_show_payment_on_invoice?: boolean;
    default_show_bank_details_on_invoice?: boolean;
    default_show_qr_on_invoice?: boolean;
    default_show_payment_terms_on_invoice?: boolean;
};

export function defaultPaymentVisibility(options?: {
    bank?: boolean;
    qr?: boolean;
    terms?: boolean;
}): Record<string, boolean> {
    return {
        [PAYMENT_VISIBILITY_BANK]: options?.bank ?? true,
        [PAYMENT_VISIBILITY_QR]: options?.qr ?? true,
        [PAYMENT_VISIBILITY_TERMS]: options?.terms ?? true,
    };
}

export function paymentFromDraft(
    draft: { document: { payment?: InvoicePaymentDetails } },
): InvoicePaymentDetails {
    return draft.document.payment ?? {};
}

function legacyPaymentBlockOn(
    visibility: Record<string, boolean> | undefined,
): boolean | null {
    if (!visibility || !('payment_block' in visibility)) {
        return null;
    }

    return Boolean(visibility.payment_block);
}

export function isPaymentBankVisible(
    visibility: Record<string, boolean> | undefined,
): boolean {
    if (visibility && PAYMENT_VISIBILITY_BANK in visibility) {
        return Boolean(visibility[PAYMENT_VISIBILITY_BANK]);
    }

    const legacy = legacyPaymentBlockOn(visibility);

    return legacy ?? true;
}

export function isPaymentQrVisible(
    visibility: Record<string, boolean> | undefined,
): boolean {
    if (visibility && PAYMENT_VISIBILITY_QR in visibility) {
        return Boolean(visibility[PAYMENT_VISIBILITY_QR]);
    }

    const legacy = legacyPaymentBlockOn(visibility);

    return legacy ?? true;
}

export function isPaymentTermsVisible(
    visibility: Record<string, boolean> | undefined,
): boolean {
    if (visibility && PAYMENT_VISIBILITY_TERMS in visibility) {
        return Boolean(visibility[PAYMENT_VISIBILITY_TERMS]);
    }

    const legacy = legacyPaymentBlockOn(visibility);

    return legacy ?? true;
}

export function isAnyPaymentSectionVisible(
    visibility: Record<string, boolean> | undefined,
): boolean {
    return (
        isPaymentBankVisible(visibility) ||
        isPaymentQrVisible(visibility) ||
        isPaymentTermsVisible(visibility)
    );
}

/** Apply company / API defaults for payment section toggles (survives template preset merges). */
export function mergePaymentVisibilityIntoDraft<
    T extends { field_visibility?: Record<string, boolean> },
>(
    draft: T,
    visibility?: Record<string, boolean> | null,
    company?: CompanyPaymentSettings | null,
): T {
    const legacy = company?.default_show_payment_on_invoice ?? true;
    const bank =
        visibility && PAYMENT_VISIBILITY_BANK in visibility
            ? Boolean(visibility[PAYMENT_VISIBILITY_BANK])
            : (company?.default_show_bank_details_on_invoice ?? legacy);
    const qr =
        visibility && PAYMENT_VISIBILITY_QR in visibility
            ? Boolean(visibility[PAYMENT_VISIBILITY_QR])
            : (company?.default_show_qr_on_invoice ?? legacy);
    const terms =
        visibility && PAYMENT_VISIBILITY_TERMS in visibility
            ? Boolean(visibility[PAYMENT_VISIBILITY_TERMS])
            : (company?.default_show_payment_terms_on_invoice ?? legacy);

    return {
        ...draft,
        field_visibility: {
            ...(draft.field_visibility ?? {}),
            [PAYMENT_VISIBILITY_BANK]: bank,
            [PAYMENT_VISIBILITY_QR]: qr,
            [PAYMENT_VISIBILITY_TERMS]: terms,
        },
    };
}

export function applyCompanyPaymentToDraft<
    T extends {
        document: { payment?: InvoicePaymentDetails };
        field_visibility?: Record<string, boolean>;
    },
>(
    draft: T,
    company?: CompanyPaymentSettings | null,
    defaults?: InvoicePaymentDetails | null,
    visibility?: Record<string, boolean> | null,
): T {
    if (!company && !defaults) {
        return draft;
    }

    const payment: InvoicePaymentDetails = {
        account_number:
            draft.document.payment?.account_number ??
            defaults?.account_number ??
            company?.account_number ??
            '',
        account_type:
            draft.document.payment?.account_type ??
            defaults?.account_type ??
            company?.account_type ??
            '',
        account_holder:
            draft.document.payment?.account_holder ??
            defaults?.account_holder ??
            company?.account_holder ??
            '',
        upi_id:
            draft.document.payment?.upi_id ??
            defaults?.upi_id ??
            company?.upi_id ??
            '',
        branch_ifsc:
            draft.document.payment?.branch_ifsc ??
            defaults?.branch_ifsc ??
            company?.branch_ifsc ??
            '',
        branch_name:
            draft.document.payment?.branch_name ??
            defaults?.branch_name ??
            company?.branch_name ??
            '',
        note:
            draft.document.payment?.note ??
            defaults?.note ??
            company?.payment_note ??
            '',
    };

    const companyPaymentTerms = company?.default_payment_terms?.trim() ?? '';

    const withPayment = {
        ...draft,
        document: {
            ...draft.document,
            payment,
            ...(companyPaymentTerms
                ? { payment_terms: companyPaymentTerms }
                : {}),
        },
    };

    return mergePaymentVisibilityIntoDraft(
        withPayment,
        visibility,
        company,
    );
}

/** Always overlay payment terms from company settings. */
export function mergePaymentTermsIntoDraft<
    T extends { document: { payment_terms?: string } },
>(draft: T, companyTerms?: string | null): T {
    return {
        ...draft,
        document: {
            ...draft.document,
            payment_terms: companyTerms?.trim() ?? '',
        },
    };
}
