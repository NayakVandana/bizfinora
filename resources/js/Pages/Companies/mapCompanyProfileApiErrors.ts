import type { CompanyProfileFieldErrors } from './validateCompanyProfileForm';

const API_FIELD_KEYS: (keyof CompanyProfileFieldErrors)[] = [
    'name',
    'address',
    'city',
    'state',
    'postal_code',
    'email',
    'phone',
    'gst',
    'pan',
    'account_number',
    'swift_bic',
];

export function mapCompanyProfileApiErrors(
    data: Record<string, unknown> | null,
): CompanyProfileFieldErrors {
    if (!data) {
        return {};
    }

    const out: CompanyProfileFieldErrors = {};
    for (const key of API_FIELD_KEYS) {
        const val = data[key];
        if (Array.isArray(val) && typeof val[0] === 'string') {
            out[key] = val[0];
        } else if (typeof val === 'string') {
            out[key] = val;
        }
    }

    return out;
}
