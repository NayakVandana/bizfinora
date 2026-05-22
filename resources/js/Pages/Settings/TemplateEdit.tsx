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
import InvoiceEditorLayout from '@/invoices/InvoiceEditorLayout';
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
                <h2 className="text-foreground text-xl font-semibold">
                    Customize template
                </h2>
            }
        >
            <Head title="Edit template" />

            <div className="py-6">
                <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('settings.templates.library')}
                        className="font-medium text-sidebar-primary hover:opacity-80 text-sm"
                    >
                        ← Back to template library
                    </Link>

                    {loading ? (
                        <p className="text-muted-foreground mt-6 text-sm">Loading…</p>
                    ) : error && !template ? (
                        <p className="mt-6 text-red-600">{error}</p>
                    ) : (
                        <div className="mt-6">
                            <InvoiceEditorLayout
                                editTabLabel="Edit template"
                                previewLabel="Live preview"
                                actions={
                                    <>
                                        <PrimaryButton
                                            disabled={saving}
                                            onClick={() => void save()}
                                            className="w-full justify-center lg:w-auto"
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
                                            className="w-full justify-center lg:w-auto"
                                        >
                                            {downloading
                                                ? 'Preparing PDF…'
                                                : 'Download PDF'}
                                        </SecondaryButton>
                                    </>
                                }
                                preview={
                                    previewDraft && seller ? (
                                        <InvoicePreview draft={previewDraft} />
                                    ) : (
                                        <div className="rounded-md border border-dashed border-border bg-muted px-3 py-4 text-center text-sm text-muted-foreground flex h-[min(50vh,400px)] items-center justify-center">
                                            Preview unavailable
                                        </div>
                                    )
                                }
                                form={
                                    <div className="space-y-6">
                                <p className="text-muted-foreground text-sm">
                                    Customize labels, notes, and other content
                                    for this template. The invoice format stays
                                    the same as when you cloned it. Save to
                                    reuse on new invoices.
                                </p>

                                {message ? (
                                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
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
                                    <p className="text-foreground mt-1 text-sm font-medium">
                                        {baseTypeLabel}
                                    </p>
                                    <p className="text-muted-foreground mt-1 text-xs">
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
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Label shown on the PDF next to the
                                        invoice date.
                                    </p>
                                </div>

                                <div>
                                    <InputLabel value="Header notes" />
                                    <textarea
                                        className="app-field"
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
                                        className="app-field"
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
                                        className="app-field"
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

                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
