import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InvoicePreview from '@/invoices/InvoicePreview';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import InvoiceTypePicker from '@/invoices/InvoiceTypePicker';
import { buildTemplatePreviewDraft } from '@/invoices/buildTemplatePreviewDraft';
import { invoiceTypeLabel } from '@/invoices/invoiceTypes';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTemplatePreviewData } from './useTemplatePreviewData';

export default function TemplatePreviewPage() {
    const { invoiceType, setInvoiceType, layout, seller, taxSettings, loading } =
        useTemplatePreviewData();
    const [downloading, setDownloading] = useState(false);

    const previewDraft = useMemo(() => {
        if (!seller) {
            return null;
        }

        return buildTemplatePreviewDraft(seller, invoiceType, taxSettings);
    }, [seller, invoiceType, taxSettings]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Template preview
                </h2>
            }
        >
            <Head title="Template preview" />

            <div className="py-6">
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-gray-500">Loading…</p>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm lg:max-w-md">
                                <p className="text-sm text-gray-600">
                                    Browse all invoice types — preview only,
                                    nothing is saved. Set your company default
                                    on{' '}
                                    <Link
                                        href={route('settings.templates')}
                                        className="font-medium text-indigo-600 underline hover:text-indigo-800"
                                    >
                                        Default template
                                    </Link>
                                    .
                                </p>

                                <div>
                                    <InputLabel value="Invoice type" />
                                    <div className="mt-2">
                                        <InvoiceTypePicker
                                            value={invoiceType}
                                            onChange={setInvoiceType}
                                            mode="preview"
                                        />
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500">
                                    Layout:{' '}
                                    {layout === 'classic'
                                        ? 'Classic'
                                        : 'Modern'}
                                </p>

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

                            <div className="lg:sticky lg:top-4 lg:self-start">
                                <p className="mb-2 text-sm font-medium text-gray-700">
                                    {invoiceTypeLabel(invoiceType)}
                                </p>
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
