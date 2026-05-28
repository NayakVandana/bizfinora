import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { TAX_PRESETS, presetForType } from '../taxPresets';
import Accordion from './Accordion';
import type { InvoiceDraft, TaxCalculationMode, TaxType } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
};

export default function TaxSettingsSection({ draft, onChange }: Props) {
    const applyPreset = (type: TaxType) => {
        const preset = presetForType(type);
        onChange({
            tax_type: type,
            tax_label: preset.tax_label,
            tax_rate: preset.tax_rate,
        });
    };

    return (
        <Accordion title="Tax settings" defaultOpen>
            <p className="text-muted-foreground text-sm">
                Tax for this invoice only. Company defaults can be updated
                separately below the form.
            </p>

            <div className="flex flex-wrap gap-2">
                {TAX_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        type="button"
                        className={
                            draft.tax_type === preset.id
                                ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                                : 'rounded-full border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted'
                        }
                        onClick={() => applyPreset(preset.id)}
                    >
                        {preset.label}
                        {preset.tax_rate > 0 ? ` ${preset.tax_rate}%` : ''}
                    </button>
                ))}
            </div>

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
                        className="app-field"
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
        </Accordion>
    );
}
