export type AdminUser = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
};

export type AdminUserRow = AdminUser & {
    current_company_id?: number | null;
    email_verified_at?: string | null;
    created_at?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
};

export type AdminUserCompany = {
    id: number;
    name: string;
    slug: string;
    role?: string | null;
    is_current?: boolean;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    tax_id?: string | null;
    tax_id_label?: string | null;
    email?: string | null;
    phone?: string | null;
    gst?: string | null;
    pan?: string | null;
    account_number?: string | null;
    account_holder?: string | null;
    account_type?: string | null;
    upi_id?: string | null;
    branch_ifsc?: string | null;
    branch_name?: string | null;
    payment_note?: string | null;
    default_payment_terms?: string | null;
    default_terms_and_conditions?: string | null;
    default_show_terms_on_invoice?: boolean;
    default_show_authorized_signature_on_invoice?: boolean;
    default_show_payment_on_invoice?: boolean;
    default_show_bank_details_on_invoice?: boolean;
    default_show_qr_on_invoice?: boolean;
    default_show_payment_terms_on_invoice?: boolean;
    swift_bic?: string | null;
    logo_data_url?: string | null;
    seller_notes?: string | null;
    default_tax_type?: string | null;
    default_tax_label?: string | null;
    default_tax_rate?: number | null;
    tax_calculation_mode?: string | null;
    tax_per_line?: boolean;
    default_invoice_template?: string | null;
    default_invoice_type?: string | null;
    default_custom_template_id?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type AdminUserDetail = AdminUserRow & {
    companies_count?: number;
    companies: AdminUserCompany[];
};

export type AdminCompanyRow = {
    id: number;
    name: string;
    slug: string;
    created_at?: string | null;
    updated_at?: string | null;
    users_count?: number;
    buyers_count?: number;
    invoices_count?: number;
};

export type AdminCompanyMember = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export type AdminCompanyBuyer = {
    id: number;
    company_name?: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    gst?: string | null;
    pan?: string | null;
    tax_id?: string | null;
    tax_id_label?: string | null;
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

export type AdminBuyerDetail = AdminCompanyBuyer & {
    company_id: number;
    company?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    created_at?: string | null;
    updated_at?: string | null;
};

export type AdminInvoiceRow = {
    id: number;
    invoice_number: string;
    status: string;
    invoice_date: string;
    due_date?: string | null;
    currency: string;
    total: number;
    buyer_id?: number | null;
    buyer_name?: string | null;
    buyer_company_name?: string | null;
    buyer_phone?: string | null;
    company_id: number;
    company_name?: string | null;
    company_slug?: string | null;
    user_id?: number | null;
    user_name?: string | null;
    user_email?: string | null;
    created_at?: string | null;
    has_share_link: boolean;
};

export type AdminCompanyDetail = AdminCompanyRow &
    Omit<AdminUserCompany, 'role' | 'is_current'> & {
        users: AdminCompanyMember[];
        buyers: AdminCompanyBuyer[];
        invoices_count?: number;
    };
