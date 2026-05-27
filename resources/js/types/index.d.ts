export interface Company {
    id: number;
    name: string;
    slug: string;
    role?: string;
    is_current?: boolean;
}

export interface User {
    id: number;
    name: string;
    email: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    email_verified_at?: string;
    created_at?: string | null;
    updated_at?: string | null;
    current_company_id?: number | null;
    current_company?: Company | null;
    companies?: Company[];
    is_admin?: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
        currentCompany: Company | null;
        companies: Company[];
    };
};
