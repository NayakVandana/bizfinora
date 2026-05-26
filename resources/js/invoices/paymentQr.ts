import QRCode from 'qrcode';
import { isPaymentQrVisible, paymentFromDraft } from './paymentTypes';
import type { InvoiceDraft, InvoiceTotals } from './types';

/** UPI deep link for scan-to-pay (amount in major currency units). */
export function buildPaymentQrPayload(
    draft: InvoiceDraft,
    total: number,
): string | null {
    if (!isPaymentQrVisible(draft.field_visibility)) {
        return null;
    }

    const payment = paymentFromDraft(draft);
    const upi = payment.upi_id?.trim();
    if (!upi) {
        return null;
    }

    const params = new URLSearchParams();
    params.set('pa', upi);

    const holder = payment.account_holder?.trim();
    if (holder) {
        params.set('pn', holder.slice(0, 100));
    }

    if (total > 0) {
        params.set('am', total.toFixed(2));
    }

    params.set('cu', draft.currency || 'INR');

    return `upi://pay?${params.toString()}`;
}

export async function attachPaymentQrToDraft(
    draft: InvoiceDraft,
    totals: InvoiceTotals,
): Promise<InvoiceDraft> {
    const payload = buildPaymentQrPayload(draft, totals.total);

    if (!payload) {
        return {
            ...draft,
            document: {
                ...draft.document,
                qr_payload: null,
                qr_data_url: null,
            },
        };
    }

    try {
        const qr_data_url = await QRCode.toDataURL(payload, {
            width: 200,
            margin: 1,
        });

        return {
            ...draft,
            document: {
                ...draft.document,
                qr_payload: payload,
                qr_data_url,
            },
        };
    } catch {
        return {
            ...draft,
            document: {
                ...draft.document,
                qr_payload: payload,
                qr_data_url: null,
            },
        };
    }
}
