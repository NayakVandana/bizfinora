import type { BuyerOption } from '@/Pages/Invoices/types';

export type BuyerFormState = Omit<BuyerOption, 'id'> & { id?: number };

export function emptyBuyerForm(): BuyerFormState {
    return {
        name: '',
        email: '',
        phone: '',
        tax_id: '',
        tax_id_label: 'VAT no',
        address: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        account_number: '',
        swift_bic: '',
        notes: '',
    };
}

export function buyerToForm(buyer: BuyerOption): BuyerFormState {
    return { ...buyer };
}
