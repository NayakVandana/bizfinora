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
    email_verified_at?: string;
    current_company_id?: number | null;
    current_company?: Company | null;
    companies?: Company[];
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
