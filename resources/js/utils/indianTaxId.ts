export function normalizeGst(gst: string): string {
    return gst.replace(/\s+/g, '').toUpperCase().slice(0, 15);
}

export function normalizePan(pan: string): string {
    return pan.replace(/\s+/g, '').toUpperCase().slice(0, 10);
}

export function validateGstOptional(gst: string): string | null {
    const value = normalizeGst(gst.trim());

    if (!value) {
        return null;
    }

    if (value.length !== 15) {
        return 'GSTIN must be exactly 15 characters.';
    }

    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(value)) {
        return 'Enter a valid GSTIN.';
    }

    return null;
}

export function validatePanOptional(pan: string): string | null {
    const value = normalizePan(pan.trim());

    if (!value) {
        return null;
    }

    if (value.length !== 10) {
        return 'PAN must be exactly 10 characters.';
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value)) {
        return 'Enter a valid PAN (e.g. ABCDE1234F).';
    }

    return null;
}
