import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { CompanyTermsSettings } from '@/invoices/termsSettings';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function TermsSettings() {
    const [form, setForm] = useState<CompanyTermsSettings>({
        default_terms_and_conditions: '',
        default_show_terms_on_invoice: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        companyApiPost<ApiEnvelope<CompanyTermsSettings>>(
            '/company/company-show',
            {},
        ).then((res) => {
            if (res.success && res.data) {
                setForm({
                    default_terms_and_conditions:
                        res.data.default_terms_and_conditions ?? '',
                    default_show_terms_on_invoice: Boolean(
                        res.data.default_show_terms_on_invoice ?? true,
                    ),
                });
            }
            setLoading(false);
        });
    }, []);

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await companyApiPost<ApiEnvelope<CompanyTermsSettings>>(
                '/company/company-terms-settings-update',
                {
                    default_terms_and_conditions:
                        form.default_terms_and_conditions ?? '',
                    default_show_terms_on_invoice:
                        form.default_show_terms_on_invoice === true,
                },
            );
            if (res.success && res.data) {
                setForm({
                    default_terms_and_conditions:
                        res.data.default_terms_and_conditions ?? '',
                    default_show_terms_on_invoice: Boolean(
                        res.data.default_show_terms_on_invoice ?? true,
                    ),
                });
            }
            setMessage(
                res.success
                    ? 'Terms and conditions saved for your active company.'
                    : (res.message ?? 'Save failed.'),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Terms and conditions
                </h2>
            }
        >
            <Head title="Terms and conditions" />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-muted-foreground text-sm">Loading…</p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
                            <div className="border-b border-border px-5 py-4 sm:px-6">
                                <p className="text-muted-foreground text-sm">
                                    Default legal or general terms shown in the
                                    invoice footer on new invoices. You can still
                                    edit them per invoice in the Terms and
                                    conditions section.
                                </p>
                            </div>

                            <div className="space-y-6 px-5 py-6 sm:px-6">
                                {message ? (
                                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                        {message}
                                    </div>
                                ) : null}

                                <div>
                                    <InputLabel value="Default text" />
                                    <textarea
                                        className="app-field mt-1 w-full"
                                        rows={8}
                                        value={
                                            form.default_terms_and_conditions ??
                                            ''
                                        }
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                default_terms_and_conditions:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="Enter your standard terms and conditions…"
                                    />
                                </div>

                                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                                    <p className="text-sm font-medium text-foreground">
                                        New invoices
                                    </p>
                                    <label className="flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            className="rounded border-input text-sidebar-primary focus:ring-ring"
                                            checked={
                                                form.default_show_terms_on_invoice ??
                                                true
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    default_show_terms_on_invoice:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Show terms and conditions on new
                                        invoices
                                    </label>
                                </div>

                                <PrimaryButton
                                    disabled={saving}
                                    onClick={() => void save()}
                                >
                                    {saving
                                        ? 'Saving…'
                                        : 'Save terms and conditions'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
