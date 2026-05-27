import AdminLayout from '@/Layouts/AdminLayout';
import { pageContainer, pageShell } from '@/lib/pageLayout';
import { formatMoney } from '@/invoices/formatMoney';
import { adminApiPost, type ApiEnvelope } from '@/api/adminClient';
import type { InvoiceSummary } from '@/types/invoiceSummary';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type AdminDashboardSummary = {
    users_count: number;
    companies_count: number;
    invoices: InvoiceSummary;
};

function StatCard({
    label,
    value,
    sub,
    href,
}: {
    label: string;
    value: string | number;
    sub?: string;
    href?: string;
}) {
    const className =
        'rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition hover:border-sidebar-primary/40';

    const content = (
        <>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                {label}
            </p>
            <p className="text-foreground mt-2 text-2xl font-semibold">
                {value}
            </p>
            {sub ? (
                <p className="text-muted-foreground mt-1 text-sm">{sub}</p>
            ) : null}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={className}>
                {content}
            </Link>
        );
    }

    return <div className={className}>{content}</div>;
}

export default function AdminDashboard() {
    const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        void adminApiPost<ApiEnvelope<AdminDashboardSummary>>(
            '/dashboard/dashboard-summary',
            {},
        )
            .then((res) => {
                if (res.success && res.data) {
                    setSummary(res.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const invoices = summary?.invoices;

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
                        ) : summary && invoices ? (
                            <div className="space-y-6 p-4 sm:p-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <StatCard
                                        label="Users"
                                        value={summary.users_count}
                                        sub="Registered accounts"
                                        href={route('admin.users.index')}
                                    />
                                    <StatCard
                                        label="Companies"
                                        value={summary.companies_count}
                                        sub="Organisations on the platform"
                                        href={route('admin.companies.index')}
                                    />
                                </div>

                                <div>
                                    <h3 className="text-muted-foreground mb-3 text-sm font-semibold uppercase tracking-wide">
                                        Invoices
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <StatCard
                                            label="All invoices"
                                            value={formatMoney(invoices.all.amount)}
                                            sub={`${invoices.all.count} invoice${invoices.all.count === 1 ? '' : 's'}`}
                                            href={route('admin.invoices.index')}
                                        />
                                        <StatCard
                                            label="Draft"
                                            value={formatMoney(invoices.draft.amount)}
                                            sub={`${invoices.draft.count} invoice${invoices.draft.count === 1 ? '' : 's'}`}
                                            href={route('admin.invoices.index')}
                                        />
                                        <StatCard
                                            label="Sent"
                                            value={formatMoney(invoices.sent.amount)}
                                            sub={`${invoices.sent.count} invoice${invoices.sent.count === 1 ? '' : 's'}`}
                                            href={route('admin.invoices.index')}
                                        />
                                        <StatCard
                                            label="Paid"
                                            value={formatMoney(invoices.paid.amount)}
                                            sub={`${invoices.paid.count} invoice${invoices.paid.count === 1 ? '' : 's'}`}
                                            href={route('admin.invoices.index')}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
