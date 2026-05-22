import { PDFViewer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';
import { calculateTotalsForDraft } from './calculateTotals';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import { usePreviewWidth } from './usePreviewWidth';
import type { InvoiceDraft } from './types';

/** A4 at ~72dpi scaled to fit sidebar previews */
const PREVIEW_MAX_WIDTH = 520;

type Props = {
    draft: InvoiceDraft;
};

export default function InvoicePreview({ draft }: Props) {
    const previewWidth = usePreviewWidth(PREVIEW_MAX_WIDTH);
    const previewHeight = Math.round(previewWidth * 1.414);
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
        <div className="flex max-h-[min(70vh,calc(100vh-10rem))] justify-center overflow-auto rounded-lg border border-border bg-muted p-2 shadow-inner sm:p-4 lg:max-h-[calc(100vh-8rem)]">
            <div
                className="mx-auto shrink-0 overflow-hidden rounded-md bg-white shadow-md"
                style={{
                    width: previewWidth,
                    height: previewHeight,
                }}
            >
                <PDFViewer
                    key={`${draft.template}-${draft.invoice_number}-${JSON.stringify(draft.field_visibility ?? {})}`}
                    width={previewWidth}
                    height={previewHeight}
                    showToolbar={false}
                >
                    <InvoicePdfDocument draft={draftWithQr} totals={totals} />
                </PDFViewer>
            </div>
        </div>
    );
}
