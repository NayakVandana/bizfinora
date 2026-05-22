import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import InvoiceBuilder from '@/invoices/InvoiceBuilder';
import {
    buildDefaultDraft,
    ensureDefaultInvoiceDates,
} from '@/invoices/defaultDraft';
import { applyTemplatePresetToDraft } from '@/invoices/templatePresets';
import type { TemplatePreset } from '@/invoices/templatePresets';
import { serializeInvoiceDraft } from '@/invoices/serializeDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import type { InvoiceDraft } from '@/invoices/types';
import type { CompanyTaxSettings } from '@/invoices/taxPresets';
import type { PartyDetails } from '@/invoices/types';
import type { BuyerOption } from '@/Pages/Invoices/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Meta = {
    seller: PartyDetails;
    next_invoice_number: string;
    tax_settings?: CompanyTaxSettings;
    default_template?: 'stripe' | 'classic';
    default_invoice_type?: string;
    default_custom_template_id?: number | null;
    custom_template_preset?: TemplatePreset | null;
};

export default function InvoicesCreate() {
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);
    const [buyers, setBuyers] = useState<BuyerOption[]>([]);
    const [saving, setSaving] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [companyTax, setCompanyTax] = useState<CompanyTaxSettings | null>(
        null,
    );

    useEffect(() => {
        Promise.all([
            companyApiPost<ApiEnvelope<Meta>>('/invoices/invoice-meta', {}),
            companyApiPost<ApiEnvelope<BuyerOption[]>>('/buyers/buyers-list', {}),
        ]).then(([metaRes, buyersRes]) => {
            if (metaRes.success && metaRes.data) {
                const seller = metaRes.data.seller;
                if (metaRes.data.tax_settings) {
                    setCompanyTax(metaRes.data.tax_settings);
                }
                let nextDraft = buildDefaultDraft(
                    seller,
                    metaRes.data.next_invoice_number,
                    (seller as { logo_data_url?: string }).logo_data_url,
                    metaRes.data.tax_settings,
                    metaRes.data.default_template ?? 'stripe',
                    metaRes.data.default_invoice_type ?? 'standard',
                );
                if (metaRes.data.custom_template_preset) {
                    nextDraft = applyTemplatePresetToDraft(
                        nextDraft,
                        metaRes.data.custom_template_preset,
                    );
                }
                setDraft(ensureDefaultInvoiceDates(nextDraft));
            }
            if (buyersRes.success && buyersRes.data) {
                setBuyers(buyersRes.data);
            }
        });
    }, []);

    const save = async () => {
        if (!draft) {
            return;
        }
        setSaving(true);
        try {
            const res = await companyApiPost<ApiEnvelope<{ id: number; share_url?: string }>>(
                '/invoices/invoice-store',
                serializeInvoiceDraft(draft),
            );
            if (res.success && res.data?.id) {
                if (res.data.share_url) {
                    setShareUrl(res.data.share_url);
                }
                router.visit(route('invoices.edit', res.data.id));
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
                    Create invoice
                </h2>
            }
        >
            <Head title="Create invoice" />

            <div className="py-6">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {!draft ? (
                        <p className="text-muted-foreground text-sm">
                            Loading builder…
                        </p>
                    ) : (
                        <InvoiceBuilder
                            draft={draft}
                            buyers={buyers}
                            onChange={setDraft}
                            onSave={() => void save()}
                            onDownload={() => void downloadInvoicePdf(draft)}
                            onEnableShare={
                                draft.id ? () => void enableShare() : undefined
                            }
                            saving={saving}
                            shareUrl={shareUrl}
                            companyTax={companyTax}
                            isNewInvoice
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
