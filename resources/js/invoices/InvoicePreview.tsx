import { PDFViewer } from '@react-pdf/renderer';
import { useEffect, useMemo, useState } from 'react';
import { calculateTotalsForDraft } from './calculateTotals';
import { InvoicePdfDocument } from './InvoicePdfDocument';
import { attachPaymentQrToDraft } from './paymentQr';
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
    const [draftWithQr, setDraftWithQr] = useState<InvoiceDraft>(draft);

    const totals = useMemo(
        () => calculateTotalsForDraft(draft),
        [draft],
    );

    useEffect(() => {
        let cancelled = false;

        void attachPaymentQrToDraft(draft, totals).then((next) => {
            if (!cancelled) {
                setDraftWithQr(next);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [draft, totals]);

    // Keep live toggles (payment/terms visibility, notes) in sync; only QR is async.
    const previewDraft = useMemo(
        () => ({
            ...draft,
            document: {
                ...draft.document,
                qr_data_url: draftWithQr.document.qr_data_url,
                qr_payload: draftWithQr.document.qr_payload,
            },
        }),
        [
            draft,
            draftWithQr.document.qr_data_url,
            draftWithQr.document.qr_payload,
        ],
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
                    key={`${draft.template}-${draft.invoice_number}-${totals.total}-${JSON.stringify(draft.field_visibility ?? {})}`}
                    width={previewWidth}
                    height={previewHeight}
                    showToolbar={false}
                >
                    <InvoicePdfDocument draft={previewDraft} totals={totals} />
                </PDFViewer>
            </div>
        </div>
    );
}
