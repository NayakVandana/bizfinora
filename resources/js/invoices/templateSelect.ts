import { applyInvoiceTypeToDraft } from './invoiceTypes';
import { applyTemplatePresetToDraft, type TemplatePreset } from './templatePresets';
import type { CustomTemplateRow, SystemTemplateRow } from './customTemplatesApi';
import type { InvoiceDraft } from './types';

export type TemplateSelectKey = string;

export function buildTemplateSelectKey(
    customId: number | null | undefined,
    systemType: string,
): TemplateSelectKey {
    return customId ? `custom:${customId}` : `system:${systemType}`;
}

export function parseTemplateSelectKey(key: TemplateSelectKey): {
    kind: 'system' | 'custom';
    id: string;
} {
    if (key.startsWith('custom:')) {
        return { kind: 'custom', id: key.slice(7) };
    }
    return { kind: 'system', id: key.startsWith('system:') ? key.slice(7) : key };
}

export function applyTemplateSelection(
    draft: InvoiceDraft,
    key: TemplateSelectKey,
    system: SystemTemplateRow[],
    custom: CustomTemplateRow[],
): InvoiceDraft {
    const { kind, id } = parseTemplateSelectKey(key);

    if (kind === 'custom') {
        const row = custom.find((t) => String(t.id) === id);
        if (row) {
            return applyTemplatePresetToDraft(draft, row.preset ?? {});
        }
        return draft;
    }

    const typeId = system.find((t) => t.id === id)?.id ?? id;
    return {
        ...draft,
        ...applyInvoiceTypeToDraft(draft, typeId),
    };
}

export function defaultTemplateLabel(
    customId: number | null | undefined,
    systemType: string,
    system: SystemTemplateRow[],
    custom: CustomTemplateRow[],
): string {
    if (customId) {
        const row = custom.find((t) => t.id === customId);
        if (row) {
            return row.name;
        }
    }
    const sys = system.find((t) => t.id === systemType);
    return sys?.name ?? systemType;
}

export function applyCompanyDefaultToDraft(
    draft: InvoiceDraft,
    systemType: string,
    customId: number | null | undefined,
    customPreset: TemplatePreset | null | undefined,
    system: SystemTemplateRow[],
): InvoiceDraft {
    if (customId && customPreset) {
        return applyTemplatePresetToDraft(draft, customPreset);
    }
    return {
        ...draft,
        ...applyInvoiceTypeToDraft(draft, systemType),
    };
}
