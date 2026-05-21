export type BuyerOption = {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    tax_id?: string | null;
    tax_id_label?: string;
    address?: string | null;
    address_line1?: string | null;
    address_line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    account_number?: string | null;
    swift_bic?: string | null;
    notes?: string | null;
};
