import type { CompanySellerProfile } from '@/invoices/types';
import { normalizeIndianMobile } from '@/utils/indianPhone';
import { normalizeGst, normalizePan } from '@/utils/indianTaxId';

export type CompanyProfileFormState = {
    name: string;
    address: string;
    gst: string;
    pan: string;
    email: string;
    phone: string;
    account_number: string;
    swift_bic: string;
    seller_notes: string;
    logo_data_url: string | null;
};

export function emptyCompanyProfileForm(): CompanyProfileFormState {
    return {
        name: '',
        address: '',
        gst: '',
        pan: '',
        email: '',
        phone: '',
        account_number: '',
        swift_bic: '',
        seller_notes: '',
        logo_data_url: null,
    };
}

export function companyProfileFormFromApi(
    data: CompanySellerProfile,
): CompanyProfileFormState {
    return {
        name: data.name ?? '',
        address: data.address ?? '',
        gst: data.gst ?? data.tax_id ?? '',
        pan: data.pan ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        account_number: data.account_number ?? '',
        swift_bic: data.swift_bic ?? '',
        seller_notes: data.seller_notes ?? '',
        logo_data_url: data.logo_data_url ?? null,
    };
}

export function companyProfileFormPayload(
    form: CompanyProfileFormState,
): Record<string, unknown> {
    return {
        name: form.name.trim(),
        address: form.address,
        gst: normalizeGst(form.gst) || null,
        pan: normalizePan(form.pan) || null,
        email: form.email,
        phone: normalizeIndianMobile(form.phone) ?? '',
        account_number: form.account_number,
        swift_bic: form.swift_bic,
        seller_notes: form.seller_notes,
        logo_data_url: form.logo_data_url,
    };
}
