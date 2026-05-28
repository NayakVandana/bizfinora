import SecondaryButton from '@/Components/SecondaryButton';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import {
    parseCompanyTaxSettings,
    type CompanyTaxSettings,
} from '../taxPresets';
import type { InvoiceDraft } from '../types';
import { useState } from 'react';

type Props = {
    draft: InvoiceDraft;
    companyTax: CompanyTaxSettings;
    onApplyToInvoice: (patch: Partial<InvoiceDraft>) => void;
    onCompanyTaxSaved?: (settings: CompanyTaxSettings) => void;
};

export default function TaxCompanyDefaultsActions({
    draft,
    companyTax,
    onApplyToInvoice,
    onCompanyTaxSaved,
}: Props) {
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const saveCompanyDefaults = async () => {
        setSaveMessage(null);
        setSaving(true);

        try {
            const res = await companyApiPost<ApiEnvelope<CompanyTaxSettings>>(
                '/company/company-tax-settings-update',
                {
                    default_tax_type: draft.tax_type,
                    default_tax_label: draft.tax_label,
                    default_tax_rate: draft.tax_rate,
                    tax_calculation_mode:
                        draft.tax_calculation_mode ?? 'exclusive',
                    tax_per_line: draft.tax_per_line ?? false,
                },
            );

            if (res.success && res.data) {
                const saved = parseCompanyTaxSettings(res.data);
                onCompanyTaxSaved?.(saved);
                setSaveMessage('Company default tax saved.');
            } else {
                setSaveMessage(res.message ?? 'Could not save tax settings.');
            }
        } finally {
            setSaving(false);
        }
    };

    const loadCompanyDefaults = () => {
        onApplyToInvoice({
            tax_type: companyTax.default_tax_type,
            tax_label: companyTax.default_tax_label,
            tax_rate: companyTax.default_tax_rate,
            tax_calculation_mode: companyTax.tax_calculation_mode,
            tax_per_line: companyTax.tax_per_line,
        });
        setSaveMessage('Loaded company defaults into this invoice.');
    };

    return (
        <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
            <p className="text-muted-foreground text-xs leading-snug">
                Saving the invoice does not change company tax defaults. Use the
                actions below only when you want to update defaults for future
                invoices.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    className="text-sm font-medium text-sidebar-primary hover:opacity-80"
                    onClick={loadCompanyDefaults}
                >
                    Load company defaults
                </button>
                <SecondaryButton
                    type="button"
                    className="normal-case tracking-normal"
                    disabled={draft.tax_type === 'none' || saving}
                    onClick={() => void saveCompanyDefaults()}
                >
                    {saving ? 'Saving…' : 'Save as company default tax'}
                </SecondaryButton>
            </div>

            {saveMessage ? (
                <p className="text-foreground mt-2 text-xs">{saveMessage}</p>
            ) : null}
        </div>
    );
}
