import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import {
    fetchTemplate,
    updateCustomTemplate,
    type CustomTemplateRow,
} from '@/invoices/customTemplatesApi';
import { buildTemplatePreviewDraft } from '@/invoices/buildTemplatePreviewDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import InvoicePreview from '@/invoices/InvoicePreview';
import { invoiceTypeLabel } from '@/invoices/invoiceTypes';
import {
    applyTemplatePresetToDraft,
    draftToTemplatePreset,
} from '@/invoices/templatePresets';
import type { CompanyTaxSettings } from '@/invoices/taxPresets';
import type { InvoiceDraft, PartyDetails } from '@/invoices/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type Props = {
    templateId: number;
};

type Meta = {
    seller: PartyDetails;
    tax_settings?: CompanyTaxSettings;
};

export default function TemplateEdit({ templateId }: Props) {
    const [template, setTemplate] = useState<CustomTemplateRow | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);
    const [seller, setSeller] = useState<PartyDetails | null>(null);
    const [taxSettings, setTaxSettings] = useState<CompanyTaxSettings | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetchTemplate(templateId),
            companyApiPost<ApiEnvelope<Meta>>('/invoices/invoice-meta', {}),
        ]).then(([tplRes, metaRes]) => {
            if (!tplRes.success || !tplRes.data) {
                setError(tplRes.message ?? 'Template not found.');
                setLoading(false);
                return;
            }

            const row = tplRes.data;
            setTemplate(row);
            setName(row.name);
            setDescription(row.description ?? '');

            let s: PartyDetails | null = null;
            let tax: CompanyTaxSettings | null = null;

            if (metaRes.success && metaRes.data) {
                s = metaRes.data.seller;
                tax = metaRes.data.tax_settings ?? null;
                setSeller(s);
                setTaxSettings(tax);
            }

            if (s) {
                const base = buildTemplatePreviewDraft(
                    s,
                    row.base_invoice_type,
                    tax,
                );
                setDraft(
                    applyTemplatePresetToDraft(base, row.preset ?? {}),
                );
            }

            setLoading(false);
        });
    }, [templateId]);

    const updateDraft = (patch: Partial<InvoiceDraft>) => {
        setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    const previewDraft = useMemo(() => draft, [draft]);

    const baseTypeLabel =
        template?.base_type_label ??
        invoiceTypeLabel(template?.base_invoice_type ?? 'standard');

    const save = async () => {
        if (!draft || !template) {
            return;
        }
        if (!name.trim()) {
            setError('Template name is required.');
            return;
        }

        setSaving(true);
        setMessage(null);
        setError(null);

        try {
            const preset = draftToTemplatePreset(draft);
            const res = await updateCustomTemplate(
                template.id,
                name.trim(),
                description.trim() || null,
                preset,
            );
            if (res.success && res.data) {
                setTemplate(res.data);
                setMessage('Template saved. It will be available when creating invoices.');
            } else {
                setError(res.message ?? 'Save failed.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Customize template
                </h2>
            }
        >
            <Head title="Edit template" />

            <div className="py-6">
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('settings.templates.library')}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to template library
                    </Link>

                    {loading ? (
                        <p className="mt-6 text-gray-500">Loading…</p>
                    ) : error && !template ? (
                        <p className="mt-6 text-red-600">{error}</p>
                    ) : (
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
                                <p className="text-sm text-gray-600">
                                    Customize labels, notes, and other content
                                    for this template. The invoice format stays
                                    the same as when you cloned it. Save to
                                    reuse on new invoices.
                                </p>

                                {message ? (
                                    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                        {message}
                                    </div>
                                ) : null}
                                {error ? (
                                    <InputError message={error} />
                                ) : null}

                                <div>
                                    <InputLabel value="Template name" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Description (optional)" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Based on" />
                                    <p className="mt-1 text-sm font-medium text-gray-900">
                                        {baseTypeLabel}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Format is fixed from the template you
                                        cloned. Change labels and notes below.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel value="Invoice number label" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={
                                            draft?.invoice_number_label ?? ''
                                        }
                                        onChange={(e) =>
                                            updateDraft({
                                                invoice_number_label:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Invoice date label" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={
                                            draft?.invoice_date_label ??
                                            'Invoice date'
                                        }
                                        onChange={(e) =>
                                            updateDraft({
                                                invoice_date_label:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Invoice date"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Label shown on the PDF next to the
                                        invoice date.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel value="Header notes" />
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={2}
                                        value={draft?.header_notes ?? ''}
                                        onChange={(e) =>
                                            updateDraft({
                                                header_notes: e.target.value,
                                            })
                                        }
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Payment terms" />
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={2}
                                        value={
                                            draft?.document.payment_terms ?? ''
                                        }
                                        onChange={(e) =>
                                            setDraft((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          document: {
                                                              ...prev.document,
                                                              payment_terms:
                                                                  e.target
                                                                      .value,
                                                          },
                                                      }
                                                    : prev,
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Document notes" />
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={2}
                                        value={draft?.document.notes ?? ''}
                                        onChange={(e) =>
                                            setDraft((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          document: {
                                                              ...prev.document,
                                                              notes: e.target
                                                                  .value,
                                                          },
                                                      }
                                                    : prev,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <PrimaryButton
                                        disabled={saving}
                                        onClick={() => void save()}
                                    >
                                        {saving ? 'Saving…' : 'Save template'}
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
                                <p className="mb-2 text-sm font-medium text-gray-700">
                                    Live preview
                                </p>
                                {previewDraft && seller ? (
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
