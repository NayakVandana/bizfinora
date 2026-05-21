export function phoneDigits(phone: string): string {
    return phone.replace(/\D+/g, '');
}

/** Normalize to 10 digits when valid; otherwise null. */
export function normalizeIndianMobile(phone: string): string | null {
    const digits = phoneDigits(phone.trim());

    if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
        return digits;
    }

    return null;
}

/** When empty, phone is optional. Otherwise exactly 10-digit Indian mobile (6–9). */
export function validateIndianMobileOptional(phone: string): string | null {
    const trimmed = phone.trim();

    if (!trimmed) {
        return null;
    }

    const digits = phoneDigits(trimmed);

    if (digits.length !== 10) {
        return 'Enter exactly 10-digit mobile number.';
    }

    if (!/^[6-9]\d{9}$/.test(digits)) {
        return 'Enter a valid Indian mobile number starting with 6–9.';
    }

    return null;
}
