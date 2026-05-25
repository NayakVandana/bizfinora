export type InvoiceTemplate = 'stripe' | 'classic';
export type TaxType = 'none' | 'vat' | 'gst' | 'sales_tax' | 'custom';
export type TaxCalculationMode = 'exclusive' | 'inclusive';
export type DiscountType = 'percent';

export type TaxBreakdownRow = {
    rate: number;
    label: string;
    taxable: number;
    tax: number;
};
export type InvoiceStatus = 'draft' | 'sent' | 'paid';

export type FieldVisibility = Record<string, boolean>;

export interface PartyDetails {
    /** Owner or contact name (buyer); seller display name */
    name: string;
    company_name?: string | null;
    email?: string | null;
    phone?: string | null;
    gst?: string | null;
    pan?: string | null;
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
}

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit?: string | null;
    unit_price: number;
    tax_rate?: number | null;
    line_tax?: number;
}

export interface InvoiceDocument {
    seller: PartyDetails;
    buyer: PartyDetails;
    items: InvoiceLineItem[];
    notes?: string;
    payment_terms?: string;
    logo_data_url?: string | null;
    qr_payload?: string | null;
    qr_data_url?: string | null;
    discount_amount?: number;
    discount_type?: DiscountType;
    discount_value?: number;
}

export interface InvoiceDraft {
    id?: number;
    buyer_id?: number | null;
    invoice_number: string;
    invoice_number_label?: string;
    status: InvoiceStatus;
    invoice_date: string;
    invoice_date_label?: string;
    due_date?: string;
    date_of_service?: string;
    currency: string;
    language: string;
    date_format?: string;
    template: InvoiceTemplate;
    invoice_type: string;
    tax_type: TaxType;
    tax_label: string;
    tax_rate: number;
    tax_calculation_mode?: TaxCalculationMode;
    tax_per_line?: boolean;
    payment_method?: string;
    header_notes?: string;
    stripe_pay_url?: string;
    qr_code_data?: string;
    qr_code_description?: string;
    person_authorized_receive?: string;
    person_authorized_issue?: string;
    discount_amount?: number;
    discount_type?: DiscountType;
    discount_value?: number;
    vat_summary_visible?: boolean;
    field_visibility?: FieldVisibility;
    document: InvoiceDocument;
}

export interface InvoiceTotals {
    subtotal: number;
    tax_amount: number;
    total: number;
    discount_amount: number;
    discount_type?: DiscountType;
    discount_percent?: number;
    tax_breakdown?: TaxBreakdownRow[];
}

export interface CompanySellerProfile {
    id: number;
    name: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    gst?: string | null;
    pan?: string | null;
    tax_id?: string | null;
    tax_id_label?: string;
    email?: string | null;
    phone?: string | null;
    account_number?: string | null;
    swift_bic?: string | null;
    logo_data_url?: string | null;
    seller_notes?: string | null;
}
