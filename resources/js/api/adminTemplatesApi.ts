import { adminApiPost, type ApiEnvelope } from '@/api/adminClient';
import type { CompanyTaxSettings } from '@/invoices/taxPresets';
import type { TemplatePreset } from '@/invoices/templatePresets';
import type { PartyDetails } from '@/invoices/types';

export type AdminTemplatePreviewData = {
    template_name: string;
    invoice_type: string;
    layout: string;
    preset: TemplatePreset | null;
    seller: PartyDetails;
    tax_settings: CompanyTaxSettings;
    base_type_label?: string;
};

export async function fetchAdminTemplatePreview(opts: {
    companyId: number;
    customTemplateId?: number;
    systemType?: string;
}) {
    return adminApiPost<ApiEnvelope<AdminTemplatePreviewData>>(
        '/invoice-templates/invoice-template-preview',
        {
            company_id: opts.companyId,
            custom_template_id: opts.customTemplateId,
            system_type: opts.systemType,
        },
    );
}
