import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import InvoiceBuilder from '@/invoices/InvoiceBuilder';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import { invoicePayloadToDraft } from '@/invoices/defaultDraft';
import { serializeInvoiceDraft } from '@/invoices/serializeDraft';
import type { InvoiceDraft } from '@/invoices/types';
import type { BuyerOption } from '@/Pages/Invoices/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type InvoicePayload = InvoiceDraft & {
    id: number;
    share_url?: string;
};

export default function InvoicesEdit({ invoiceId }: { invoiceId: number }) {
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);
    const [buyers, setBuyers] = useState<BuyerOption[]>([]);
    const [saving, setSaving] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    useEffect(() => {
        Promise.all([
            companyApiPost<ApiEnvelope<InvoicePayload>>(
                '/invoices/invoice-show',
                { id: invoiceId },
            ),
            companyApiPost<ApiEnvelope<BuyerOption[]>>('/buyers/buyers-list', {}),
        ]).then(([invoiceRes, buyersRes]) => {
            if (invoiceRes.success && invoiceRes.data) {
                setDraft(
                    invoicePayloadToDraft(
                        invoiceRes.data as unknown as Record<string, unknown>,
                    ),
                );
                setShareUrl(invoiceRes.data.share_url ?? null);
            }
            if (buyersRes.success && buyersRes.data) {
                setBuyers(buyersRes.data);
            }
        });
    }, [invoiceId]);

    const save = async () => {
        if (!draft?.id) {
            return;
        }
        setSaving(true);
        try {
            const res = await companyApiPost<ApiEnvelope<InvoicePayload>>(
                '/invoices/invoice-update',
                serializeInvoiceDraft(draft),
            );
            if (res.success && res.data) {
                setDraft(
                    invoicePayloadToDraft(
                        res.data as unknown as Record<string, unknown>,
                    ),
                );
                if (res.data.share_url) {
                    setShareUrl(res.data.share_url);
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const enableShare = async () => {
        if (!draft?.id) {
            return;
        }
        const res = await companyApiPost<
            ApiEnvelope<{ share_url: string }>
        >('/invoices/invoice-share-enable', { id: draft.id });
        if (res.success && res.data?.share_url) {
            setShareUrl(res.data.share_url);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Edit invoice
                </h2>
            }
        >
            <Head title="Edit invoice" />

            <div className="py-6">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {!draft ? (
                        <p className="text-muted-foreground text-sm">Loading…</p>
                    ) : (
                        <InvoiceBuilder
                            draft={draft}
                            buyers={buyers}
                            onChange={setDraft}
                            onSave={() => void save()}
                            onDownload={() => void downloadInvoicePdf(draft)}
                            onEnableShare={() => void enableShare()}
                            saving={saving}
                            shareUrl={shareUrl}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
