import { PDFViewer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';
import { calculateTotalsForDraft } from './calculateTotals';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import type { InvoiceDraft } from './types';

export default function InvoicePreview({ draft }: { draft: InvoiceDraft }) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

    const totals = useMemo(
        () => calculateTotalsForDraft(draft),
        [draft],
    );

    const payload = draft.document.qr_payload?.trim();

    useEffect(() => {
        if (!payload) {
            setQrDataUrl(null);

            return;
        }

        QRCode.toDataURL(payload, { width: 200, margin: 1 })
            .then(setQrDataUrl)
            .catch(() => setQrDataUrl(null));
    }, [payload]);

    const draftWithQr: InvoiceDraft = useMemo(
        () => ({
            ...draft,
            document: {
                ...draft.document,
                qr_data_url: qrDataUrl,
            },
        }),
        [draft, qrDataUrl],
    );

    return (
        <div className="h-full min-h-[640px] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-inner">
            <PDFViewer width="100%" height="100%" showToolbar={false}>
                <InvoicePdfDocument draft={draftWithQr} totals={totals} />
            </PDFViewer>
        </div>
    );
}
