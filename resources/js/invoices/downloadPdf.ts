import { pdf } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { calculateTotalsForDraft } from './calculateTotals';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import type { InvoiceDraft } from './types';

async function draftWithQr(draft: InvoiceDraft): Promise<InvoiceDraft> {
    const payload = draft.document.qr_payload?.trim();
    if (!payload) {
        return draft;
    }

    try {
        const qr_data_url = await QRCode.toDataURL(payload, {
            width: 200,
            margin: 1,
        });

        return {
            ...draft,
            document: { ...draft.document, qr_data_url },
        };
    } catch {
        return draft;
    }
}

export async function downloadInvoicePdf(draft: InvoiceDraft): Promise<void> {
    const ready = await draftWithQr(draft);
    const totals = calculateTotalsForDraft(ready);
    const blob = await pdf(
        InvoicePdfDocument({ draft: ready, totals }),
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${draft.invoice_number || 'invoice'}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}
