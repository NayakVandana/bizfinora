export type AdminDetailField = {
    label: string;
    value?: string | number | boolean | null;
    multiline?: boolean;
    fullWidth?: boolean;
};

export function displayText(value?: string | number | boolean | null): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}

export function formatAdminDate(value?: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString();
}

export function fieldHasValue(field: AdminDetailField): boolean {
    if (typeof field.value === 'boolean') {
        return true;
    }

    if (field.value === null || field.value === undefined || field.value === '') {
        return false;
    }

    return displayText(field.value) !== '—';
}

export function filterNonemptyFields(
    fields: AdminDetailField[],
): AdminDetailField[] {
    return fields.filter(fieldHasValue);
}
