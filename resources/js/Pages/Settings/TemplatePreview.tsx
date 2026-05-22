import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InvoiceEditorLayout from '@/invoices/InvoiceEditorLayout';
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
                <h2 className="text-foreground text-xl font-semibold">
                    Template preview
                </h2>
            }
        >
            <Head title="Template preview" />

            <div className="py-6">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-muted-foreground text-sm">Loading…</p>
                    ) : (
                        <InvoiceEditorLayout
                            editTabLabel="Invoice types"
                            previewLabel={invoiceTypeLabel(invoiceType)}
                            actions={
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
                                    className="w-full justify-center lg:w-auto"
                                >
                                    {downloading
                                        ? 'Preparing PDF…'
                                        : 'Download PDF'}
                                </SecondaryButton>
                            }
                            preview={
                                previewDraft ? (
                                    <InvoicePreview draft={previewDraft} />
                                ) : (
                                    <div className="rounded-md border border-dashed border-border bg-muted px-3 py-4 text-center text-sm text-muted-foreground flex h-[min(50vh,400px)] items-center justify-center">
                                        Preview unavailable
                                    </div>
                                )
                            }
                            form={
                                <div className="space-y-4 lg:max-w-md">
                                <p className="text-muted-foreground text-sm">
                                    Browse all invoice types — preview only,
                                    nothing is saved. Set your company default
                                    on{' '}
                                    <Link
                                        href={route('settings.templates')}
                                        className="font-medium text-sidebar-primary hover:opacity-80 underline"
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

                                <p className="text-muted-foreground text-xs">
                                    Layout:{' '}
                                    {layout === 'classic'
                                        ? 'Classic'
                                        : 'Modern'}
                                </p>

                                </div>
                            }
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
