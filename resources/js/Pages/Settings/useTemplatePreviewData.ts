import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { getInvoiceType } from '@/invoices/invoiceTypes';
import type { CompanyTaxSettings } from '@/invoices/taxPresets';
import type { PartyDetails } from '@/invoices/types';
import { useEffect, useState } from 'react';

type TemplateSettings = {
    default_invoice_type?: string;
    default_invoice_template?: string;
    default_tax_type?: string;
    default_tax_label?: string;
    default_tax_rate?: number;
    tax_calculation_mode?: string;
    tax_per_line?: boolean;
};

type Meta = {
    seller: PartyDetails;
    tax_settings?: CompanyTaxSettings;
    default_invoice_type?: string;
};

export function useTemplatePreviewData() {
    const [invoiceType, setInvoiceType] = useState('standard');
    const [savedInvoiceType, setSavedInvoiceType] = useState('standard');
    const [seller, setSeller] = useState<PartyDetails | null>(null);
    const [taxSettings, setTaxSettings] = useState<CompanyTaxSettings | null>(
        null,
    );
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            companyApiPost<ApiEnvelope<TemplateSettings>>(
                '/company/company-show',
                {},
            ),
            companyApiPost<ApiEnvelope<Meta>>('/invoices/invoice-meta', {}),
        ]).then(([companyRes, metaRes]) => {
            let type = 'standard';

            if (companyRes.success && companyRes.data) {
                type = companyRes.data.default_invoice_type ?? 'standard';
                setTaxSettings({
                    default_tax_type:
                        (companyRes.data.default_tax_type as CompanyTaxSettings['default_tax_type']) ??
                        'vat',
                    default_tax_label:
                        companyRes.data.default_tax_label ?? 'VAT',
                    default_tax_rate: Number(
                        companyRes.data.default_tax_rate ?? 0,
                    ),
                    tax_calculation_mode:
                        (companyRes.data.tax_calculation_mode as CompanyTaxSettings['tax_calculation_mode']) ??
                        'exclusive',
                    tax_per_line: Boolean(companyRes.data.tax_per_line ?? false),
                });
            }
            if (metaRes.success && metaRes.data) {
                if (metaRes.data.default_invoice_type) {
                    type = metaRes.data.default_invoice_type;
                }
                if (metaRes.data.seller) {
                    setSeller(metaRes.data.seller);
                }
                if (metaRes.data.tax_settings) {
                    setTaxSettings(metaRes.data.tax_settings);
                }
            }

            setInvoiceType(type);
            setSavedInvoiceType(type);
            setLoading(false);
        });
    }, []);

    const layout =
        getInvoiceType(invoiceType)?.layout ?? 'stripe';

    return {
        invoiceType,
        setInvoiceType,
        savedInvoiceType,
        setSavedInvoiceType,
        layout,
        seller,
        taxSettings,
        loading,
    };
}
