import { grossLineSubtotal } from './calculateTotals';
import type { InvoiceDocument, InvoiceDraft } from './types';

export const DISCOUNT_PERCENT_MAX = 60;

/** User-entered discount percentage (0–60). */
export function readDiscountPercent(draft: InvoiceDraft): number {
    const lineGross = grossLineSubtotal(draft.document);
    let raw =
        draft.discount_value ??
        draft.document.discount_value ??
        draft.discount_percent ??
        draft.document.discount_percent ??
        0;

    if (
        raw <= 0 &&
        lineGross > 0 &&
        (draft.discount_amount ?? draft.document.discount_amount ?? 0) > 0
    ) {
        const legacyType =
            draft.discount_type ?? draft.document.discount_type ?? 'amount';
        const legacyAmount =
            draft.discount_amount ?? draft.document.discount_amount ?? 0;

        if (legacyType === 'amount') {
            raw = (legacyAmount / lineGross) * 100;
        }
    }

    return Math.min(
        DISCOUNT_PERCENT_MAX,
        Math.max(0, Number(raw) || 0),
    );
}

/** Rupee discount from line gross and percentage (max 60%). */
export function resolveDiscountAmount(
    document: InvoiceDocument,
    percent: number,
): number {
    const lineGross = grossLineSubtotal(document);
    const pct = Math.min(
        DISCOUNT_PERCENT_MAX,
        Math.max(0, Number(percent) || 0),
    );

    if (pct <= 0 || lineGross <= 0) {
        return 0;
    }

    return Math.round(((lineGross * pct) / 100) * 100) / 100;
}

export function resolveDiscountForDraft(draft: InvoiceDraft): number {
    return resolveDiscountAmount(draft.document, readDiscountPercent(draft));
}
