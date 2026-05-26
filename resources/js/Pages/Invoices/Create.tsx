import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import InvoiceBuilder from '@/invoices/InvoiceBuilder';
import { submitInvoiceForm } from '@/invoices/submitInvoiceForm';
import {
    scrollToFirstInvoiceError,
    syncLiveInvoiceErrors,
    type InvoiceFieldErrors,
} from '@/invoices/validateInvoiceForm';
import {
    buildDefaultDraft,
    ensureDefaultInvoiceDates,
} from '@/invoices/defaultDraft';
import { applyTemplatePresetToDraft } from '@/invoices/templatePresets';
import type { TemplatePreset } from '@/invoices/templatePresets';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import type { InvoiceDraft } from '@/invoices/types';
import {
    companyContextFromMeta,
    mergeCompanyContextIntoDraft,
    type InvoiceCompanyContext,
} from '@/invoices/companyContext';
import type { CompanyTaxSettings } from '@/invoices/taxPresets';
import type { InvoicePaymentDetails } from '@/invoices/types';
import type { PartyDetails } from '@/invoices/types';
import type { BuyerOption } from '@/Pages/Invoices/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { CompanyPaymentSettings } from '@/invoices/paymentTypes';
import type { CompanyTermsSettings } from '@/invoices/termsSettings';

type Meta = {
    seller: PartyDetails;
    next_invoice_number: string;
    tax_settings?: CompanyTaxSettings;
    payment_settings?: CompanyPaymentSettings;
    payment_defaults?: InvoicePaymentDetails;
    payment_field_visibility?: Record<string, boolean>;
    default_payment_terms?: string | null;
    terms_settings?: CompanyTermsSettings;
    terms_field_visibility?: Record<string, boolean>;
    default_template?: 'stripe' | 'classic';
    default_invoice_type?: string;
    default_custom_template_id?: number | null;
    custom_template_preset?: TemplatePreset | null;
};

export default function InvoicesCreate() {
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);
    const [companyContext, setCompanyContext] =
        useState<InvoiceCompanyContext | null>(null);
    const [buyers, setBuyers] = useState<BuyerOption[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<InvoiceFieldErrors>({});
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
                const ctx = companyContextFromMeta(
                    metaRes.data as unknown as Record<string, unknown>,
                );
                setCompanyContext(ctx);

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
                    metaRes.data.payment_settings,
                    metaRes.data.payment_defaults,
                    metaRes.data.payment_field_visibility,
                    metaRes.data.terms_settings,
                );
                if (metaRes.data.custom_template_preset) {
                    nextDraft = applyTemplatePresetToDraft(
                        nextDraft,
                        metaRes.data.custom_template_preset,
                    );
                }
                nextDraft = mergeCompanyContextIntoDraft(nextDraft, ctx);
                setDraft(ensureDefaultInvoiceDates(nextDraft));
            }
            if (buyersRes.success && buyersRes.data) {
                setBuyers(buyersRes.data);
            }
        });
    }, []);

    const handleChange = (next: InvoiceDraft) => {
        setDraft(mergeCompanyContextIntoDraft(next, companyContext));
        setErrors((prev) => syncLiveInvoiceErrors(next, prev));
    };

    const handleCompanyContextChange = (context: InvoiceCompanyContext) => {
        setCompanyContext(context);
        setDraft((prev) =>
            prev ? mergeCompanyContextIntoDraft(prev, context) : prev,
        );
    };

    const save = async () => {
        if (!draft) {
            return;
        }
        setSaving(true);
        try {
            const result = await submitInvoiceForm(draft);
            if (result.ok) {
                if (typeof result.data.share_url === 'string') {
                    setShareUrl(result.data.share_url);
                }
                router.visit(route('invoices.edit', result.data.id as number));
            } else {
                setErrors(result.errors);
                scrollToFirstInvoiceError(result.errors);
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
                            errors={errors}
                            onErrors={setErrors}
                            onChange={handleChange}
                            companyContext={companyContext}
                            onCompanyContextChange={handleCompanyContextChange}
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
