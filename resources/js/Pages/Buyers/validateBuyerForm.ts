import type { BuyerFormState } from './buyerForm';
import { validateIndianMobileOptional } from '@/utils/indianPhone';

export type BuyerFieldErrors = Partial<
    Record<keyof BuyerFormState | '_form', string>
>;

export function validateBuyerForm(form: BuyerFormState): BuyerFieldErrors {
    const errors: BuyerFieldErrors = {};

    if (!form.name.trim()) {
        errors.name = 'Name is required.';
    }

    const phoneError = validateIndianMobileOptional(form.phone ?? '');
    if (phoneError) {
        errors.phone = phoneError;
    }

    return errors;
}

export function mapBuyerApiErrors(data: unknown): BuyerFieldErrors {
    if (!data || typeof data !== 'object') {
        return {};
    }

    const out: BuyerFieldErrors = {};
    const record = data as Record<string, unknown>;
    const keys: (keyof BuyerFormState)[] = [
        'name',
        'email',
        'phone',
        'tax_id',
        'address',
        'city',
        'country',
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
