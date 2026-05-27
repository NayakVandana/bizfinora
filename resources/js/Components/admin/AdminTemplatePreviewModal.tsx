import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import { fetchAdminTemplatePreview } from '@/api/adminTemplatesApi';
import { buildTemplatePreviewDraft } from '@/invoices/buildTemplatePreviewDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import InvoicePreview from '@/invoices/InvoicePreview';
import { invoiceTypeLabel } from '@/invoices/invoiceTypes';
import { applyTemplatePresetToDraft } from '@/invoices/templatePresets';
import type { InvoiceDraft } from '@/invoices/types';
import type { AdminTemplateRow } from '@/types/admin';
import { useEffect, useState } from 'react';

type Props = {
    row: AdminTemplateRow | null;
    onClose: () => void;
};

export default function AdminTemplatePreviewModal({ row, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);

    useEffect(() => {
        if (!row?.company_id) {
            setDraft(null);
            setError(null);
            setLoading(false);
            return;
        }

        let cancelled = false;

        setLoading(true);
        setError(null);
        setDraft(null);

        void fetchAdminTemplatePreview({
            companyId: row.company_id,
            customTemplateId: row.is_custom ? Number(row.id) : undefined,
            systemType: row.is_custom ? undefined : String(row.id),
        })
            .then((res) => {
                if (cancelled) {
                    return;
                }

                if (!res.success || !res.data) {
                    setError(res.message ?? 'Could not load preview.');
                    return;
                }

                const base = buildTemplatePreviewDraft(
                    res.data.seller,
                    res.data.invoice_type,
                    res.data.tax_settings,
                );

                setDraft(
                    res.data.preset
                        ? applyTemplatePresetToDraft(base, res.data.preset)
                        : base,
                );
            })
            .catch(() => {
                if (!cancelled) {
                    setError('Could not load preview.');
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [row]);

    const handleDownload = async () => {
        if (!draft) {
            return;
        }

        setDownloading(true);
        try {
            await downloadInvoicePdf(draft);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <Modal show={row !== null} onClose={onClose} maxWidth="6xl">
            <div className="flex max-h-[90vh] flex-col">
                <div className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="text-foreground text-lg font-semibold">
                            {row?.name ?? 'Template preview'}
                        </h3>
                        {row ? (
                            <p className="text-muted-foreground mt-1 text-sm">
                                {row.is_custom ? 'Custom' : 'General'}
                                {' · '}
                                {invoiceTypeLabel(
                                    row.base_invoice_type ?? 'standard',
                                )}
                                {' · '}
                                {row.layout === 'classic' ? 'Classic' : 'Modern'}
                                {row.company_name ? (
                                    <>
                                        {' · '}
                                        {row.company_name}
                                    </>
                                ) : null}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <SecondaryButton
                            type="button"
                            className="normal-case tracking-normal"
                            disabled={!draft || downloading || loading}
                            onClick={() => void handleDownload()}
                        >
                            {downloading ? 'Preparing PDF…' : 'Download PDF'}
                        </SecondaryButton>
                        <SecondaryButton
                            type="button"
                            className="normal-case tracking-normal"
                            onClick={onClose}
                        >
                            Close
                        </SecondaryButton>
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-br from-muted/40 via-background to-background p-5">
                    {loading ? (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                            Loading preview…
                        </p>
                    ) : error ? (
                        <p className="text-destructive py-12 text-center text-sm">
                            {error}
                        </p>
                    ) : draft ? (
                        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/20 ring-1 ring-black/5">
                            <InvoicePreview draft={draft} />
                        </div>
                    ) : (
                        <p className="text-muted-foreground py-12 text-center text-sm">
                            Preview unavailable.
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}
