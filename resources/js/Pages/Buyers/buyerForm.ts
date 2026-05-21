import type { BuyerOption } from '@/Pages/Invoices/types';

export type BuyerFormState = {
    id?: number;
    company_name: string;
    /** Owner / contact person — stored in DB column `name` */
    name: string;
    email: string;
    phone: string;
    gst: string;
    pan: string;
    address: string;
};

export function emptyBuyerForm(): BuyerFormState {
    return {
        company_name: '',
        name: '',
        email: '',
        phone: '',
        gst: '',
        pan: '',
        address: '',
    };
}

export function buyerToForm(buyer: BuyerOption): BuyerFormState {
    return {
        id: buyer.id,
        company_name: buyer.company_name ?? '',
        name: buyer.name ?? '',
        email: buyer.email ?? '',
        phone: buyer.phone ?? '',
        gst: buyer.gst ?? buyer.tax_id ?? '',
        pan: buyer.pan ?? '',
        address: buyer.address ?? '',
    };
}
