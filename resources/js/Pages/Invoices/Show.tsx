import InvoiceViewPanel from '@/invoices/InvoiceViewPanel';
import {
    companyContextFromMeta,
    mergeCompanyContextIntoDraft,
} from '@/invoices/companyContext';
import { invoicePayloadToDraft } from '@/invoices/defaultDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import type { InvoiceDraft } from '@/invoices/types';
import { invoiceIsEditable } from '@/invoices/invoiceActions';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type InvoicePayload = InvoiceDraft & {
    id: number;
    share_url?: string | null;
};

export default function InvoicesShow({ invoiceId }: { invoiceId: number }) {
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasShareLink, setHasShareLink] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [shareMessage, setShareMessage] = useState<string | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        const res = await companyApiPost<ApiEnvelope<InvoicePayload>>(
            '/invoices/invoice-show',
            { id: invoiceId },
        );

        if (res.success && res.data) {
            const payload = res.data as unknown as Record<string, unknown>;
            setDraft(
                mergeCompanyContextIntoDraft(
                    invoicePayloadToDraft(payload),
                    companyContextFromMeta(payload),
                ),
            );
            setHasShareLink(Boolean(res.data.share_url));
            setCreatedAt(
                typeof payload.created_at === 'string'
                    ? payload.created_at
                    : null,
            );
            setUpdatedAt(
                typeof payload.updated_at === 'string'
                    ? payload.updated_at
                    : null,
            );
        } else {
            setError(res.message ?? 'Invoice not found.');
        }

        setLoading(false);
    }, [invoiceId]);

    useEffect(() => {
        void load();
    }, [load]);

    const downloadInvoice = async () => {
        if (!draft) {
            return;
        }

        setShareMessage(null);
        setDownloading(true);
        try {
            await downloadInvoicePdf(draft);
        } finally {
            setDownloading(false);
        }
    };

    const createShareLink = async () => {
        setShareMessage(null);
        setSharing(true);
        try {
            const res = await companyApiPost<
                ApiEnvelope<{ share_url: string }>
            >('/invoices/invoice-share-enable', { id: invoiceId });

            if (res.success && res.data?.share_url) {
                setHasShareLink(true);

                try {
                    await navigator.clipboard.writeText(res.data.share_url);
                    setShareMessage('Share link copied to clipboard.');
                } catch {
                    setShareMessage(res.data.share_url);
                }
            }
        } finally {
            setSharing(false);
        }
    };

    const title = draft?.invoice_number ?? 'Invoice';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    {loading ? 'Invoice' : title}
                </h2>
            }
        >
            <Head title={loading ? 'Invoice' : title} />

            <div className="py-6">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('invoices.index')}
                        className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1 text-sm"
                    >
                        ← Back to invoices
                    </Link>

                    <div className="mt-6">
                        <InvoiceViewPanel
                            draft={draft}
                            loading={loading}
                            error={error}
                            hasShareLink={hasShareLink}
                            downloading={downloading}
                            sharing={sharing}
                            shareMessage={shareMessage}
                            createdAt={createdAt}
                            updatedAt={updatedAt}
                            onDownload={() => void downloadInvoice()}
                            onShare={() => void createShareLink()}
                            editHref={
                                draft && invoiceIsEditable(draft.status)
                                    ? route('invoices.edit', invoiceId)
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
