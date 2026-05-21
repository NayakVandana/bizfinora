import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import InvoicePreview from '@/invoices/InvoicePreview';
import TemplatePicker from '@/invoices/TemplatePicker';
import { buildTemplatePreviewDraft } from '@/invoices/buildTemplatePreviewDraft';
import { templateLabel } from '@/invoices/templatePresets';
import type { InvoiceTemplate } from '@/invoices/types';
import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTemplatePreviewData } from './useTemplatePreviewData';

type TemplateSettings = {
    default_invoice_template: InvoiceTemplate;
};

export default function TemplateDefault() {
    const {
        template,
        setTemplate,
        savedTemplate,
        setSavedTemplate,
        seller,
        taxSettings,
        loading,
    } = useTemplatePreviewData();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const previewDraft = useMemo(() => {
        if (!seller) {
            return null;
        }

        return buildTemplatePreviewDraft(seller, template, taxSettings);
    }, [seller, template, taxSettings]);

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await companyApiPost<ApiEnvelope<TemplateSettings>>(
                '/company/company-template-settings-update',
                { default_invoice_template: template },
            );
            if (res.success) {
                setSavedTemplate(template);
            }
            setMessage(
                res.success
                    ? 'Default template saved for your active company.'
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
                                    Choose a default layout for new invoices.
                                    The preview updates as you select an
                                    option — save when you are ready.
                                </p>

                                {message ? (
                                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                        {message}
                                    </div>
                                ) : null}

                                <div>
                                    <InputLabel value="Default for new invoices" />
                                    <div className="mt-2">
                                        <TemplatePicker
                                            value={template}
                                            onChange={setTemplate}
                                            mode="preview"
                                        />
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700">
                                    Selected:{' '}
                                    <strong>{templateLabel(template)}</strong>
                                    {savedTemplate !== template ? (
                                        <span className="text-amber-700">
                                            {' '}
                                            (unsaved — saved default is{' '}
                                            {templateLabel(savedTemplate)})
                                        </span>
                                    ) : null}
                                </p>

                                <PrimaryButton
                                    disabled={
                                        saving || template === savedTemplate
                                    }
                                    onClick={() => void save()}
                                >
                                    {saving
                                        ? 'Saving…'
                                        : 'Save default template'}
                                </PrimaryButton>
                            </div>

                            <div className="lg:sticky lg:top-4 lg:self-start">
                                <p className="mb-2 text-sm font-medium text-gray-700">
                                    Live preview — {templateLabel(template)}
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
