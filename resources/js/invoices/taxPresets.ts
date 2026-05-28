import type { TaxCalculationMode, TaxType } from './types';

export type TaxPreset = {
    id: TaxType;
    label: string;
    tax_label: string;
    tax_rate: number;
};

export const TAX_PRESETS: TaxPreset[] = [
    { id: 'none', label: 'No tax', tax_label: '', tax_rate: 0 },
    { id: 'vat', label: 'VAT', tax_label: 'VAT', tax_rate: 20 },
    { id: 'gst', label: 'GST', tax_label: 'GST', tax_rate: 18 },
    { id: 'sales_tax', label: 'Sales tax', tax_label: 'Sales tax', tax_rate: 10 },
    { id: 'custom', label: 'Custom', tax_label: 'Tax', tax_rate: 0 },
];

export function presetForType(type: TaxType): TaxPreset {
    return TAX_PRESETS.find((p) => p.id === type) ?? TAX_PRESETS[4];
}

export type CompanyTaxSettings = {
    default_tax_type: TaxType;
    default_tax_label: string;
    default_tax_rate: number;
    tax_calculation_mode: TaxCalculationMode;
    tax_per_line: boolean;
};

export const DEFAULT_COMPANY_TAX: CompanyTaxSettings = {
    default_tax_type: 'vat',
    default_tax_label: 'VAT',
    default_tax_rate: 0,
    tax_calculation_mode: 'exclusive',
    tax_per_line: false,
};

export function parseCompanyTaxSettings(
    data: Partial<CompanyTaxSettings>,
): CompanyTaxSettings {
    return {
        default_tax_type: (data.default_tax_type as TaxType) ?? 'vat',
        default_tax_label: data.default_tax_label ?? 'VAT',
        default_tax_rate: Number(data.default_tax_rate ?? 0),
        tax_calculation_mode:
            (data.tax_calculation_mode as TaxCalculationMode) ?? 'exclusive',
        tax_per_line: Boolean(data.tax_per_line ?? false),
    };
}
