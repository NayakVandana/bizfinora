import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { TAX_PRESETS, presetForType, type CompanyTaxSettings } from '../taxPresets';
import Accordion from './Accordion';
import type { InvoiceDraft, TaxCalculationMode, TaxType } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
    companyTax?: CompanyTaxSettings | null;
};

export default function TaxSettingsSection({
    draft,
    onChange,
    companyTax,
}: Props) {
    const applyPreset = (type: TaxType) => {
        const preset = presetForType(type);
        onChange({
            tax_type: type,
            tax_label: preset.tax_label,
            tax_rate: preset.tax_rate,
        });
    };

    const saveCompanyDefaults = async () => {
        const res = await companyApiPost<ApiEnvelope<CompanyTaxSettings>>(
            '/company/company-tax-settings-update',
            {
                default_tax_type: draft.tax_type,
                default_tax_label: draft.tax_label,
                default_tax_rate: draft.tax_rate,
                tax_calculation_mode: draft.tax_calculation_mode ?? 'exclusive',
                tax_per_line: draft.tax_per_line ?? false,
            },
        );
        if (res.success) {
            alert('Tax defaults saved for this company.');
        } else {
            alert(res.message ?? 'Could not save tax settings.');
        }
    };

    const loadCompanyDefaults = () => {
        if (!companyTax) {
            return;
        }
        onChange({
            tax_type: companyTax.default_tax_type,
            tax_label: companyTax.default_tax_label,
            tax_rate: companyTax.default_tax_rate,
            tax_calculation_mode: companyTax.tax_calculation_mode,
            tax_per_line: companyTax.tax_per_line,
        });
    };

    return (
        <Accordion title="Tax settings" defaultOpen>
            <p className="text-sm text-gray-600">
                Customize tax label, rate, calculation mode, and per-line tax.
            </p>

            <div className="flex flex-wrap gap-2">
                {TAX_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        type="button"
                        className={
                            draft.tax_type === preset.id
                                ? 'rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white'
                                : 'rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50'
                        }
                        onClick={() => applyPreset(preset.id)}
                    >
                        {preset.label}
                        {preset.tax_rate > 0 ? ` ${preset.tax_rate}%` : ''}
                    </button>
                ))}
            </div>

            {companyTax ? (
                <button
                    type="button"
                    className="text-sm text-indigo-600"
                    onClick={loadCompanyDefaults}
                >
                    Load company defaults
                </button>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <InputLabel value="Tax label (on PDF)" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={draft.tax_label}
                        disabled={draft.tax_type === 'none'}
                        onChange={(e) =>
                            onChange({ tax_label: e.target.value })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="Tax rate %" />
                    <TextInput
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className="mt-1 block w-full"
                        value={draft.tax_rate}
                        disabled={draft.tax_type === 'none'}
                        onChange={(e) =>
                            onChange({ tax_rate: Number(e.target.value) })
                        }
                    />
                </div>
                <div className="sm:col-span-2">
                    <InputLabel value="Calculation mode" />
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={draft.tax_calculation_mode ?? 'exclusive'}
                        disabled={draft.tax_type === 'none'}
                        onChange={(e) =>
                            onChange({
                                tax_calculation_mode: e.target
                                    .value as TaxCalculationMode,
                            })
                        }
                    >
                        <option value="exclusive">
                            Tax exclusive (added on top)
                        </option>
                        <option value="inclusive">
                            Tax inclusive (included in line prices)
                        </option>
                    </select>
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={draft.tax_per_line ?? false}
                    disabled={draft.tax_type === 'none'}
                    onChange={(e) =>
                        onChange({ tax_per_line: e.target.checked })
                    }
                />
                Per-line tax rates (override invoice rate on each item)
            </label>

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={draft.vat_summary_visible !== false}
                    onChange={(e) =>
                        onChange({ vat_summary_visible: e.target.checked })
                    }
                />
                Show tax summary table on PDF
            </label>

            <PrimaryButton
                type="button"
                className="text-sm"
                disabled={draft.tax_type === 'none'}
                onClick={() => void saveCompanyDefaults()}
            >
                Save as company default tax
            </PrimaryButton>
        </Accordion>
    );
}
