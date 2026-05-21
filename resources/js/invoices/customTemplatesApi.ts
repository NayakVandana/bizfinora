import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { TemplatePreset } from './templatePresets';

export type SystemTemplateRow = {
    id: string;
    name: string;
    description: string;
    base_invoice_type: string;
    layout: string;
    is_custom: false;
    is_system: true;
};

export type CustomTemplateRow = {
    id: number;
    name: string;
    description: string | null;
    base_invoice_type: string;
    base_type_label: string;
    layout: string;
    preset: TemplatePreset;
    is_custom: true;
    created_at?: string;
    updated_at?: string;
};

export type TemplatesListData = {
    system: SystemTemplateRow[];
    custom: CustomTemplateRow[];
    default_invoice_type: string;
    default_custom_template_id: number | null;
};

export async function fetchTemplatesList() {
    return companyApiPost<ApiEnvelope<TemplatesListData>>(
        '/invoice-templates/invoice-templates-list',
        {},
    );
}

export async function fetchTemplate(id: number) {
    return companyApiPost<ApiEnvelope<CustomTemplateRow>>(
        '/invoice-templates/invoice-template-show',
        { id },
    );
}

export async function cloneSystemTemplate(systemType: string, name?: string) {
    return companyApiPost<ApiEnvelope<CustomTemplateRow>>(
        '/invoice-templates/invoice-template-clone',
        { system_type: systemType, name },
    );
}

export async function cloneCustomTemplate(id: number, name?: string) {
    return companyApiPost<ApiEnvelope<CustomTemplateRow>>(
        '/invoice-templates/invoice-template-clone',
        { id, name },
    );
}

export async function updateCustomTemplate(
    id: number,
    name: string,
    description: string | null,
    preset: TemplatePreset,
) {
    return companyApiPost<ApiEnvelope<CustomTemplateRow>>(
        '/invoice-templates/invoice-template-update',
        { id, name, description, preset },
    );
}

export async function deleteCustomTemplate(id: number) {
    return companyApiPost<ApiEnvelope<null>>(
        '/invoice-templates/invoice-template-destroy',
        { id },
    );
}

export async function setDefaultTemplate(opts: {
    customTemplateId?: number | null;
    systemType?: string;
}) {
    return companyApiPost<
        ApiEnvelope<{
            default_invoice_type: string;
            default_custom_template_id: number | null;
        }>
    >('/invoice-templates/invoice-template-set-default', {
        custom_template_id: opts.customTemplateId ?? null,
        system_type: opts.systemType,
    });
}
