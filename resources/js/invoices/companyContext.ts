import { resolveDefaultPaymentTerms } from './paymentTermsPresets';
import {
    mergePaymentTermsIntoDraft,
    mergePaymentVisibilityIntoDraft,
    PAYMENT_VISIBILITY_BANK,
    PAYMENT_VISIBILITY_QR,
    PAYMENT_VISIBILITY_TERMS,
    type CompanyPaymentSettings,
} from './paymentTypes';
import type { InvoiceDraft, InvoicePaymentDetails } from './types';
import {
    mergeTermsAndConditionsIntoDraft,
    mergeTermsVisibilityIntoDraft,
    TERMS_VISIBILITY,
    type CompanyTermsSettings,
} from './termsSettings';

export type InvoiceCompanyContext = {
    payment_settings?: CompanyPaymentSettings | null;
    payment_defaults?: InvoicePaymentDetails | null;
    payment_field_visibility?: Record<string, boolean> | null;
    terms_settings?: CompanyTermsSettings | null;
    terms_field_visibility?: Record<string, boolean> | null;
};

export const COMPANY_DERIVED_VISIBILITY_KEYS = [
    PAYMENT_VISIBILITY_BANK,
    PAYMENT_VISIBILITY_QR,
    PAYMENT_VISIBILITY_TERMS,
    TERMS_VISIBILITY,
] as const;

/** Always overlay payment & terms from company settings (not stored on invoice). */
export function mergeCompanyContextIntoDraft(
    draft: InvoiceDraft,
    context?: InvoiceCompanyContext | null,
): InvoiceDraft {
    if (!context) {
        return draft;
    }

    let next = mergePaymentVisibilityIntoDraft(
        draft,
        context.payment_field_visibility,
        context.payment_settings,
    );
    next = mergePaymentTermsIntoDraft(
        next,
        resolveDefaultPaymentTerms(
            context.payment_settings?.default_payment_terms,
            next.invoice_type,
        ),
    );
    next = applyCompanyPaymentDocument(next, context);
    next = mergeTermsAndConditionsIntoDraft(
        next,
        context.terms_settings?.default_terms_and_conditions,
    );
    next = mergeTermsVisibilityIntoDraft(
        next,
        context.terms_field_visibility,
        context.terms_settings,
    );

    return next;
}

function applyCompanyPaymentDocument(
    draft: InvoiceDraft,
    context: InvoiceCompanyContext,
): InvoiceDraft {
    const company = context.payment_settings;
    const defaults = context.payment_defaults;

    if (!company && !defaults) {
        return draft;
    }

    const payment: InvoicePaymentDetails = {
        account_number:
            defaults?.account_number ?? company?.account_number ?? '',
        account_type: defaults?.account_type ?? company?.account_type ?? '',
        account_holder:
            defaults?.account_holder ?? company?.account_holder ?? '',
        upi_id: defaults?.upi_id ?? company?.upi_id ?? '',
        branch_ifsc: defaults?.branch_ifsc ?? company?.branch_ifsc ?? '',
        branch_name: defaults?.branch_name ?? company?.branch_name ?? '',
        note: defaults?.note ?? company?.payment_note ?? '',
    };

    return {
        ...draft,
        document: {
            ...draft.document,
            payment,
        },
    };
}

export function companyContextFromMeta(
    data: Record<string, unknown>,
): InvoiceCompanyContext {
    return {
        payment_settings: data.payment_settings as CompanyPaymentSettings,
        payment_defaults: data.payment_defaults as InvoicePaymentDetails,
        payment_field_visibility: data.payment_field_visibility as Record<
            string,
            boolean
        >,
        terms_settings: data.terms_settings as CompanyTermsSettings,
        terms_field_visibility: data.terms_field_visibility as Record<
            string,
            boolean
        >,
    };
}

export function stripCompanyDerivedFromFieldVisibility(
    visibility: Record<string, boolean> | undefined,
): Record<string, boolean> {
    const next = { ...(visibility ?? {}) };

    for (const key of COMPANY_DERIVED_VISIBILITY_KEYS) {
        delete next[key];
    }

    return next;
}
