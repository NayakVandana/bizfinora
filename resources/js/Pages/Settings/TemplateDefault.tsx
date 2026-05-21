import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import InvoicePreview from '@/invoices/InvoicePreview';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import InvoiceTypePicker from '@/invoices/InvoiceTypePicker';
import { buildTemplatePreviewDraft } from '@/invoices/buildTemplatePreviewDraft';
import { invoiceTypeLabel } from '@/invoices/invoiceTypes';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTemplatePreviewData } from './useTemplatePreviewData';

type TemplateSettings = {
    default_invoice_type: string;
    default_invoice_template: string;
};

export default function TemplateDefault() {
    const {
        invoiceType,
        setInvoiceType,
        savedInvoiceType,
        setSavedInvoiceType,
        layout,
        seller,
        taxSettings,
        loading,
    } = useTemplatePreviewData();
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const previewDraft = useMemo(() => {
        if (!seller) {
            return null;
        }

        return buildTemplatePreviewDraft(seller, invoiceType, taxSettings);
    }, [seller, invoiceType, taxSettings]);

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await companyApiPost<ApiEnvelope<TemplateSettings>>(
                '/company/company-template-settings-update',
                {
                    default_invoice_type: invoiceType,
                    default_invoice_template: layout,
                },
            );
            if (res.success) {
                setSavedInvoiceType(invoiceType);
            }
            setMessage(
                res.success
                    ? 'Default invoice template saved for your active company.'
                    : (res.message ?? 'Save failed.'),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Default template
                </h2>
            }
        >
            <Head title="Default template" />

            <div className="py-6">
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-gray-500">Loading…</p>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
                                <p className="text-sm text-gray-600">
                                    Choose the default invoice type for new
                                    invoices. Preview updates as you select —
                                    save when ready.{' '}
                                    <Link
                                        href={route(
                                            'settings.templates.library',
                                        )}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        Browse & clone templates
                                    </Link>
                                </p>

                                {message ? (
                                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                        {message}
                                    </div>
                                ) : null}

                                <div>
                                    <InputLabel value="Invoice type (30 templates)" />
                                    <div className="mt-2">
                                        <InvoiceTypePicker
                                            value={invoiceType}
                                            onChange={setInvoiceType}
                                            mode="preview"
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700">
                                    Selected:{' '}
                                    <strong>
                                        {invoiceTypeLabel(invoiceType)}
                                    </strong>
                                    <span className="text-gray-500">
                                        {' '}
                                        ({layout === 'classic'
                                            ? 'Classic'
                                            : 'Modern'}{' '}
                                        layout)
                                    </span>
                                    {savedInvoiceType !== invoiceType ? (
                                        <span className="text-amber-700">
                                            {' '}
                                            (unsaved — saved default is{' '}
                                            {invoiceTypeLabel(
                                                savedInvoiceType,
                                            )}
                                            )
                                        </span>
                                    ) : null}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <PrimaryButton
                                        disabled={
                                            saving ||
                                            invoiceType === savedInvoiceType
                                        }
                                        onClick={() => void save()}
                                    >
                                        {saving
                                            ? 'Saving…'
                                            : 'Save default template'}
                                    </PrimaryButton>
                                    <SecondaryButton
                                        disabled={!previewDraft || downloading}
                                        onClick={async () => {
                                            if (!previewDraft) {
                                                return;
                                            }
                                            setDownloading(true);
                                            try {
                                                await downloadInvoicePdf(
                                                    previewDraft,
                                                );
                                            } finally {
                                                setDownloading(false);
                                            }
                                        }}
                                    >
                                        {downloading
                                            ? 'Preparing PDF…'
                                            : 'Download PDF'}
                                    </SecondaryButton>
                                </div>
                            </div>

                            <div className="lg:sticky lg:top-4 lg:self-start">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-gray-700">
                                        Live preview —{' '}
                                        {invoiceTypeLabel(invoiceType)}
                                    </p>
                                </div>
                                {previewDraft ? (
                                    <InvoicePreview
                                        draft={previewDraft}
                                        variant="fit"
                                    />
                                ) : (
                                    <div className="flex h-[640px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
                                        Preview unavailable
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
