import InputLabel from '@/Components/InputLabel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InvoicePreview from '@/invoices/InvoicePreview';
import TemplatePicker from '@/invoices/TemplatePicker';
import { buildTemplatePreviewDraft } from '@/invoices/buildTemplatePreviewDraft';
import { templateLabel } from '@/invoices/templatePresets';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTemplatePreviewData } from './useTemplatePreviewData';

export default function TemplatePreviewPage() {
    const { template, setTemplate, seller, taxSettings, loading } =
        useTemplatePreviewData();

    const previewDraft = useMemo(() => {
        if (!seller) {
            return null;
        }

        return buildTemplatePreviewDraft(seller, template, taxSettings);
    }, [seller, template, taxSettings]);

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
                                    Preview only — switching options here does
                                    not change your saved default. Set the
                                    default on{' '}
                                    <Link
                                        href={route('settings.templates')}
                                        className="font-medium text-indigo-600 underline hover:text-indigo-800"
                                    >
                                        Default template
                                    </Link>
                                    .
                                </p>

                                <div>
                                    <InputLabel value="Preview layout" />
                                    <div className="mt-2">
                                        <TemplatePicker
                                            value={template}
                                            onChange={setTemplate}
                                            mode="preview"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:sticky lg:top-4 lg:self-start">
                                <p className="mb-2 text-sm font-medium text-gray-700">
                                    {templateLabel(template)}
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
