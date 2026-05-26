import AdminLayout from '@/Layouts/AdminLayout';
import { pageContainer, pageShell } from '@/lib/pageLayout';
import {
    adminApiPost,
    type ApiEnvelope,
    type Paginated,
} from '@/api/adminClient';
import type { AdminCompanyRow, AdminUserRow } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function StatCard({
    label,
    value,
    sub,
    href,
}: {
    label: string;
    value: string | number;
    sub?: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition hover:border-sidebar-primary/40"
        >
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                {label}
            </p>
            <p className="text-foreground mt-2 text-2xl font-semibold">
                {value}
            </p>
            {sub ? (
                <p className="text-muted-foreground mt-1 text-sm">{sub}</p>
            ) : null}
        </Link>
    );
}

export default function AdminDashboard() {
    const [usersTotal, setUsersTotal] = useState<number | null>(null);
    const [companiesTotal, setCompaniesTotal] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [usersRes, companiesRes] = await Promise.all([
                    adminApiPost<ApiEnvelope<Paginated<AdminUserRow>>>(
                        '/users/users-list',
                        { per_page: 1, current_page: 1 },
                    ),
                    adminApiPost<ApiEnvelope<Paginated<AdminCompanyRow>>>(
                        '/companies/companies-list',
                        { per_page: 1, current_page: 1 },
                    ),
                ]);

                if (usersRes.success && usersRes.data) {
                    setUsersTotal(usersRes.data.total);
                }

                if (companiesRes.success && companiesRes.data) {
                    setCompaniesTotal(companiesRes.data.total);
                }
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, []);

    return (
        <AdminLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Dashboard
                </h2>
            }
        >
            <Head title="Admin dashboard" />

            <div className={pageShell}>
                <div className={pageContainer}>
                    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                        <div className="border-b border-border px-4 py-4 sm:px-6">
                            <p className="text-muted-foreground text-sm">
                                Platform overview across all tenants
                            </p>
                        </div>

                        {loading ? (
                            <p className="text-muted-foreground p-6 text-center">
                                Loading…
                            </p>
                        ) : (
                            <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                                <StatCard
                                    label="Users"
                                    value={usersTotal ?? '—'}
                                    sub="Registered accounts"
                                    href={route('admin.users.index')}
                                />
                                <StatCard
                                    label="Companies"
                                    value={companiesTotal ?? '—'}
                                    sub="Organisations on the platform"
                                    href={route('admin.companies.index')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
