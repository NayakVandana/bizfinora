const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
];

const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
];

function twoDigits(n: number): string {
    if (n < 20) {
        return ones[n];
    }

    const t = Math.floor(n / 10);
    const o = n % 10;

    return `${tens[t]}${o ? ` ${ones[o]}` : ''}`.trim();
}

function threeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const parts: string[] = [];

    if (h > 0) {
        parts.push(`${ones[h]} Hundred`);
    }
    if (rest > 0) {
        parts.push(twoDigits(rest));
    }

    return parts.join(' ').trim();
}

function indianGroupWords(n: number): string {
    if (n === 0) {
        return '';
    }

    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = n % 1000;
    const parts: string[] = [];

    if (crore > 0) {
        parts.push(`${threeDigits(crore)} Crore`);
    }
    if (lakh > 0) {
        parts.push(`${threeDigits(lakh)} Lakh`);
    }
    if (thousand > 0) {
        parts.push(`${threeDigits(thousand)} Thousand`);
    }
    if (hundred > 0) {
        parts.push(threeDigits(hundred));
    }

    return parts.join(' ').trim();
}

/** e.g. 1180 → "One Thousand One Hundred Eighty Rupees only" */
export function amountInWords(amount: number, currency = 'INR'): string {
    const value = Math.max(0, Math.round(amount * 100) / 100);
    const rupees = Math.floor(value);
    const paise = Math.round((value - rupees) * 100);

    if (rupees === 0 && paise === 0) {
        return currency === 'INR' ? 'Zero Rupees only' : 'Zero only';
    }

    const unit = currency === 'INR' ? 'Rupees' : currency;
    let words = indianGroupWords(rupees);

    if (words) {
        words += ` ${unit}`;
    }

    if (paise > 0) {
        const paiseWords = twoDigits(paise);
        words += words
            ? ` and ${paiseWords} Paise`
            : `${paiseWords} Paise`;
    }

    return `${words} only`.replace(/\s+/g, ' ').trim();
}
