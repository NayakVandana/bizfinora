import { validateIndianMobileRequired } from '@/utils/indianPhone';
import { validateGstOptional, validatePanOptional } from '@/utils/indianTaxId';
import type { CompanyProfileFormState } from './companyProfileForm';

export type CompanyProfileFieldErrors = Partial<
    Record<
        | 'name'
        | 'address'
        | 'email'
        | 'phone'
        | 'gst'
        | 'pan'
        | 'account_number'
        | 'swift_bic',
        string
    >
>;

export function validateCompanyProfileForm(
    form: CompanyProfileFormState,
): CompanyProfileFieldErrors {
    const errors: CompanyProfileFieldErrors = {};

    if (!form.name.trim()) {
        errors.name = 'Company name is required.';
    }

    if (!form.address.trim()) {
        errors.address = 'Address is required.';
    }

    const phoneError = validateIndianMobileRequired(form.phone);
    if (phoneError) {
        errors.phone = phoneError;
    }

    const email = form.email.trim();
    if (!email) {
        errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Enter a valid email address.';
    }

    const gstError = validateGstOptional(form.gst);
    if (gstError) {
        errors.gst = gstError;
    }

    const panError = validatePanOptional(form.pan);
    if (panError) {
        errors.pan = panError;
    }

    return errors;
}

export function isCompanyProfileFormComplete(
    form: CompanyProfileFormState,
): boolean {
    return Object.keys(validateCompanyProfileForm(form)).length === 0;
}
