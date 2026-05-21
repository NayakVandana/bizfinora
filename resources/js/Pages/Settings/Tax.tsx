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
                <h2 className="text-xl font-semibold text-gray-800">
                    Tax settings
                </h2>
            }
        >
            <Head title="Tax settings" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-gray-500">Loading…</p>
                    ) : (
                        <div className="space-y-6 rounded-lg bg-white p-6 shadow-sm">
                            <p className="text-sm text-gray-600">
                                Defaults apply to new invoices for the active
                                company. You can still override tax on each
                                invoice.
                            </p>

                            {message ? (
                                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                    {message}
                                </div>
                            ) : null}

                            <div className="flex flex-wrap gap-2">
                                {TAX_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        className={
                                            form.default_tax_type === preset.id
                                                ? 'rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white'
                                                : 'rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700'
                                        }
                                        onClick={() => applyPreset(preset.id)}
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
                                        disabled={form.default_tax_type === 'none'}
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
                                        disabled={form.default_tax_type === 'none'}
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
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={form.tax_calculation_mode}
                                        disabled={form.default_tax_type === 'none'}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                tax_calculation_mode: e.target
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
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.tax_per_line}
                                        disabled={form.default_tax_type === 'none'}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                tax_per_line: e.target.checked,
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
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
