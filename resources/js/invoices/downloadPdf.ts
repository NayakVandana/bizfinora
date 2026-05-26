import { pdf } from '@react-pdf/renderer';
import { calculateTotalsForDraft } from './calculateTotals';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import { attachPaymentQrToDraft } from './paymentQr';
import type { InvoiceDraft } from './types';

export async function downloadInvoicePdf(draft: InvoiceDraft): Promise<void> {
    const totals = calculateTotalsForDraft(draft);
    const ready = await attachPaymentQrToDraft(draft, totals);
    const blob = await pdf(
        InvoicePdfDocument({ draft: ready, totals }),
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeNumber = (draft.invoice_number || 'invoice').replace(
        /[^\w.-]+/g,
        '-',
    );
    const type = draft.invoice_type ?? 'standard';
    link.download = `${type}-${safeNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}
