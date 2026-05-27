import type { BuyerFormState } from './buyerForm';
import { validateIndianMobileRequired } from '@/utils/indianPhone';
import { validateGstOptional, validatePanOptional } from '@/utils/indianTaxId';

export type BuyerFieldErrors = Partial<
    Record<keyof BuyerFormState | '_form', string>
>;

export function validateBuyerForm(form: BuyerFormState): BuyerFieldErrors {
    const errors: BuyerFieldErrors = {};

    if (!form.company_name.trim()) {
        errors.company_name = 'Company name is required.';
    }

    if (!form.name.trim()) {
        errors.name = 'Owner name is required.';
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

    if (!form.address.trim()) {
        errors.address = 'Address is required.';
    }

    if (!form.city.trim()) {
        errors.city = 'City is required.';
    }

    if (!form.state.trim()) {
        errors.state = 'State is required.';
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

export function isBuyerFormComplete(form: BuyerFormState): boolean {
    return Object.keys(validateBuyerForm(form)).length === 0;
}

export function mapBuyerApiErrors(data: unknown): BuyerFieldErrors {
    if (!data || typeof data !== 'object') {
        return {};
    }

    const out: BuyerFieldErrors = {};
    const record = data as Record<string, unknown>;
    const keys: (keyof BuyerFormState)[] = [
        'company_name',
        'name',
        'email',
        'phone',
        'gst',
        'pan',
        'address',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'notes',
    ];

    for (const key of keys) {
        const val = record[key];
        if (Array.isArray(val) && typeof val[0] === 'string') {
            out[key] = val[0];
        } else if (typeof val === 'string') {
            out[key] = val;
        }
    }

    return out;
}
