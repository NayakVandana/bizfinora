import { PDFViewer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';
import { calculateTotalsForDraft } from './calculateTotals';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import type { InvoiceDraft } from './types';

/** A4 at ~72dpi scaled to fit sidebar previews */
const PREVIEW_WIDTH = 520;
const PREVIEW_HEIGHT = Math.round(PREVIEW_WIDTH * 1.414);

type Props = {
    draft: InvoiceDraft;
    /** Fit fixed A4 frame with scroll (settings). Default stretches to parent height. */
    variant?: 'fit' | 'fill';
};

export default function InvoicePreview({
    draft,
    variant = 'fill',
}: Props) {
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

    const viewer = (
        <PDFViewer
            key={`${draft.template}-${draft.invoice_number}`}
            width={variant === 'fit' ? PREVIEW_WIDTH : '100%'}
            height={variant === 'fit' ? PREVIEW_HEIGHT : '100%'}
            showToolbar={false}
        >
            <InvoicePdfDocument draft={draftWithQr} totals={totals} />
        </PDFViewer>
    );

    if (variant === 'fit') {
        return (
            <div className="flex max-h-[calc(100vh-8rem)] justify-center overflow-auto rounded-lg border border-gray-200 bg-slate-100 p-4 shadow-inner">
                <div
                    className="shrink-0 overflow-hidden rounded-md bg-white shadow-md"
                    style={{
                        width: PREVIEW_WIDTH,
                        height: PREVIEW_HEIGHT,
                    }}
                >
                    {viewer}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-[640px] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-inner">
            {viewer}
        </div>
    );
}
