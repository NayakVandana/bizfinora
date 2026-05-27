const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
] as const;

function isDateOnlyString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function parseDisplayDate(value: string): Date | null {
    const trimmed = value.trim();

    if (!trimmed) {
        return null;
    }

    if (isDateOnlyString(trimmed)) {
        const [year, month, day] = trimmed.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    const date = new Date(trimmed);

    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDisplayDatePart(date: Date): string {
    return `${date.getDate()} ${MONTHS[date.getMonth()]},${date.getFullYear()}`;
}

function formatDisplayTimePart(date: Date): string {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours %= 12;
    if (hours === 0) {
        hours = 12;
    }

    return `${hours}:${minutes} ${ampm}`;
}

/** Date-only display: `27 May,2026` */
export function formatDisplayDate(value?: string | null): string {
    if (!value) {
        return '—';
    }

    const date = parseDisplayDate(value);

    if (!date) {
        return value;
    }

    return formatDisplayDatePart(date);
}

/** Datetime display: `27 May,2026 | 10:53 AM` (date-only inputs omit the time). */
export function formatDisplayDateTime(value?: string | null): string {
    if (!value) {
        return '—';
    }

    if (isDateOnlyString(value)) {
        return formatDisplayDate(value);
    }

    const date = parseDisplayDate(value);

    if (!date) {
        return value;
    }

    return `${formatDisplayDatePart(date)} | ${formatDisplayTimePart(date)}`;
}
