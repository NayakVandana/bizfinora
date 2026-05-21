import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { BuyerOption } from '@/Pages/Invoices/types';
import type { BuyerFormState } from './buyerForm';
import { normalizeIndianMobile } from '@/utils/indianPhone';
import {
    mapBuyerApiErrors,
    validateBuyerForm,
    type BuyerFieldErrors,
} from './validateBuyerForm';

export type SubmitBuyerResult =
    | { ok: true; buyer: BuyerOption }
    | { ok: false; errors: BuyerFieldErrors };

export async function submitBuyerForm(
    form: BuyerFormState,
): Promise<SubmitBuyerResult> {
    const clientErrors = validateBuyerForm(form);
    if (Object.keys(clientErrors).length > 0) {
        return { ok: false, errors: clientErrors };
    }

    const phone = normalizeIndianMobile(form.phone ?? '');
    const payload = {
        ...form,
        phone: phone ?? '',
        id: form.id,
    };

    const path = form.id ? '/buyers/buyer-update' : '/buyers/buyer-store';
    const res = await companyApiPost<ApiEnvelope<BuyerOption>>(path, payload);

    if (res.success && res.data) {
        return { ok: true, buyer: res.data };
    }

    const apiErrors = mapBuyerApiErrors(res.data);
    if (Object.keys(apiErrors).length > 0) {
        return { ok: false, errors: apiErrors };
    }

    return {
        ok: false,
        errors: { _form: res.message ?? 'Could not save buyer.' },
    };
}
