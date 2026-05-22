import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { TAX_PRESETS, presetForType } from '@/invoices/taxPresets';
import type { CompanyTaxSettings } from '@/invoices/taxPresets';
import type { TaxCalculationMode, TaxType } from '@/invoices/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function TaxSettings() {
    const [form, setForm] = useState<CompanyTaxSettings>({
        default_tax_type: 'vat',
        default_tax_label: 'VAT',
        default_tax_rate: 0,
        tax_calculation_mode: 'exclusive',
        tax_per_line: false,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        companyApiPost<ApiEnvelope<CompanyTaxSettings>>(
            '/company/company-show',
            {},
        ).then((res) => {
            if (res.success && res.data) {
                setForm({
                    default_tax_type:
                        (res.data.default_tax_type as TaxType) ?? 'vat',
                    default_tax_label: res.data.default_tax_label ?? 'VAT',
                    default_tax_rate: Number(res.data.default_tax_rate ?? 0),
                    tax_calculation_mode:
                        (res.data.tax_calculation_mode as TaxCalculationMode) ??
                        'exclusive',
                    tax_per_line: Boolean(res.data.tax_per_line ?? false),
                });
            }
            setLoading(false);
        });
    }, []);

    const applyPreset = (type: TaxType) => {
        const preset = presetForType(type);
        setForm({
            ...form,
            default_tax_type: type,
            default_tax_label: preset.tax_label,
            default_tax_rate: preset.tax_rate,
        });
    };

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await companyApiPost<ApiEnvelope<CompanyTaxSettings>>(
                '/company/company-tax-settings-update',
                form,
            );
            setMessage(
                res.success
                    ? 'Tax settings saved for your active company.'
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
                    Tax settings
                </h2>
            }
        >
            <Head title="Tax settings" />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-muted-foreground text-sm">Loading…</p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
                            <div className="border-b border-border px-5 py-4 sm:px-6">
                                <p className="text-muted-foreground text-sm">
                                    Defaults apply to new invoices for the active
                                    company. You can still override tax on each
                                    invoice.
                                </p>
                            </div>

                            <div className="space-y-6 px-5 py-6 sm:px-6">
                                {message ? (
                                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                        {message}
                                    </div>
                                ) : null}

                                <div className="flex flex-wrap gap-2">
                                    {TAX_PRESETS.map((preset) => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            className={
                                                form.default_tax_type ===
                                                preset.id
                                                    ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                                                    : 'rounded-full border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted'
                                            }
                                            onClick={() =>
                                                applyPreset(preset.id)
                                            }
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid gap-4">
                                    <div>
                                        <InputLabel value="Tax label" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={form.default_tax_label}
                                            disabled={
                                                form.default_tax_type === 'none'
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    default_tax_label:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Default tax rate %" />
                                        <TextInput
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            className="mt-1 block w-full"
                                            value={form.default_tax_rate}
                                            disabled={
                                                form.default_tax_type === 'none'
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    default_tax_rate: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Calculation mode" />
                                        <select
                                            className="app-field"
                                            value={form.tax_calculation_mode}
                                            disabled={
                                                form.default_tax_type === 'none'
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    tax_calculation_mode: e
                                                        .target
                                                        .value as TaxCalculationMode,
                                                })
                                            }
                                        >
                                            <option value="exclusive">
                                                Tax exclusive
                                            </option>
                                            <option value="inclusive">
                                                Tax inclusive
                                            </option>
                                        </select>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            className="rounded border-input text-sidebar-primary focus:ring-ring"
                                            checked={form.tax_per_line}
                                            disabled={
                                                form.default_tax_type === 'none'
                                            }
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    tax_per_line:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Enable per-line tax rates by default
                                    </label>
                                </div>

                                <PrimaryButton
                                    disabled={saving}
                                    onClick={() => void save()}
                                >
                                    {saving ? 'Saving…' : 'Save tax settings'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
