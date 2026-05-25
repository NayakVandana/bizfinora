import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { serializeInvoiceDraft } from './serializeDraft';
import type { InvoiceDraft } from './types';
import {
    mapInvoiceApiErrors,
    validateInvoiceForm,
    type InvoiceFieldErrors,
} from './validateInvoiceForm';

export type SubmitInvoiceResult =
    | { ok: true; data: Record<string, unknown> }
    | { ok: false; errors: InvoiceFieldErrors };

export async function submitInvoiceForm(
    draft: InvoiceDraft,
): Promise<SubmitInvoiceResult> {
    const clientErrors = validateInvoiceForm(draft);
    if (Object.keys(clientErrors).length > 0) {
        return { ok: false, errors: clientErrors };
    }

    const path = draft.id
        ? '/invoices/invoice-update'
        : '/invoices/invoice-store';
    const res = await companyApiPost<ApiEnvelope<Record<string, unknown>>>(
        path,
        serializeInvoiceDraft(draft),
    );

    if (res.success && res.data && typeof res.data.id === 'number') {
        return { ok: true, data: res.data };
    }

    const apiErrors = mapInvoiceApiErrors(res.data);
    if (Object.keys(apiErrors).length > 0) {
        return { ok: false, errors: apiErrors };
    }

    return {
        ok: false,
        errors: { _form: res.message ?? 'Could not save invoice.' },
    };
}
