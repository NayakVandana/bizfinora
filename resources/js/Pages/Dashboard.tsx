import ListingIndex from '@/Components/ListingIndex';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { pageContainer, pageShell } from '@/lib/pageLayout';
import { listingIndexThClass } from '@/utils/listingIndex';
import { useAuthUser } from '@/auth/useAuthUser';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { formatMoney } from '@/invoices/formatMoney';
import { statusBadgeClass } from '@/utils/statusBadgeClass';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type RecentInvoice = {
    id: number;
    invoice_number: string;
    status: string;
    invoice_date: string;
    total: number;
    buyer_name?: string | null;
};

type DashboardSummary = {
    invoices: {
        total: number;
        draft: number;
        sent: number;
        paid: number;
    };
    amounts: {
        draft: number;
        sent: number;
        paid: number;
        all: number;
    };
    buyers_count: number;
    recent_invoices: RecentInvoice[];
};

const quickLinks = [
    {
        title: 'New invoice',
        description: 'Create and download a PDF',
        href: 'invoices.create',
    },
    {
        title: 'Invoices',
        description: 'View and manage all invoices',
        href: 'invoices.index',
    },
    {
        title: 'Buyers',
        description: 'Customers for your invoices',
        href: 'buyers.index',
    },
    {
        title: 'New buyer',
        description: 'Add a bill-to contact',
        href: 'buyers.create',
    },
    {
        title: 'Company profile',
        description: 'Logo, seller details, tax',
        href: 'companies.index',
    },
    {
        title: 'Templates',
        description: 'Default invoice type & library',
        href: 'settings.templates.library',
    },
] as const;

function StatCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: string | number;
    sub?: string;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-0 text-xs">
                {label}
            </p>
            <p className="text-foreground mt-1 text-2xl font-semibold">{value}</p>
            {sub ? (
                <p className="text-muted-foreground mt-1 text-sm">{sub}</p>
            ) : null}
        </div>
    );
}

export default function Dashboard() {
    const { user, currentCompany, companies, loading: authLoading } =
        useAuthUser();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!currentCompany) {
            setSummary(null);
            setLoading(false);

            return;
        }

        setLoading(true);
        setError(null);

        void companyApiPost<ApiEnvelope<DashboardSummary>>(
            '/dashboard/dashboard-summary',
            {},
        )
            .then((res) => {
                if (res.success && res.data) {
                    setSummary(res.data);
                } else {
                    setError(res.message ?? 'Could not load dashboard.');
                }
            })
            .catch(() => {
                setError('Could not load dashboard.');
            })
            .finally(() => setLoading(false));
    }, [authLoading, currentCompany?.id]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold leading-tight">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className={pageShell}>
                <div className={`${pageContainer} space-y-6`}>
                    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm p-4 sm:p-6">
                        <p className="text-foreground text-lg">
                            Welcome, <strong>{user?.name}</strong>
                        </p>
                        {currentCompany ? (
                            <p className="text-muted-foreground mt-1 text-sm">
                                Active company:{' '}
                                <strong>{currentCompany.name}</strong>
                                {companies.length > 1 ? (
                                    <span>
                                        {' '}
                                        · switch in the header menu
                                    </span>
                                ) : null}
                            </p>
                        ) : (
                            <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                                Select or create a company to use invoices and
                                buyers.{' '}
                                <Link
                                    href={route('companies.create')}
                                    className="font-medium underline dark:text-amber-200"
                                >
                                    New company
                                </Link>
                            </p>
                        )}
                    </div>

                    {!currentCompany ? null : loading ? (
                        <p className="text-muted-foreground text-center text-sm">
                            Loading summary…
                        </p>
                    ) : error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
                            {error}
                        </p>
                    ) : summary ? (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <StatCard
                                    label="Invoices"
                                    value={summary.invoices.total}
                                    sub={`${summary.invoices.draft} draft · ${summary.invoices.sent} sent · ${summary.invoices.paid} paid`}
                                />
                                <StatCard
                                    label="Buyers"
                                    value={summary.buyers_count}
                                    sub="Saved bill-to contacts"
                                />
                                <StatCard
                                    label="Outstanding (sent)"
                                    value={formatMoney(summary.amounts.sent)}
                                    sub={`${summary.invoices.sent} invoice${summary.invoices.sent === 1 ? '' : 's'}`}
                                />
                                <StatCard
                                    label="Paid total"
                                    value={formatMoney(summary.amounts.paid)}
                                    sub={`${summary.invoices.paid} invoice${summary.invoices.paid === 1 ? '' : 's'}`}
                                />
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                                    Quick actions
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {quickLinks.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={route(item.href)}
                                            className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm transition hover:border-accent hover:shadow-md"
                                        >
                                            <p className="text-foreground font-semibold">
                                                {item.title}
                                            </p>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {item.description}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Link href={route('invoices.create')}>
                                        <PrimaryButton type="button">
                                            New invoice
                                        </PrimaryButton>
                                    </Link>
                                    <Link href={route('buyers.create')}>
                                        <SecondaryButton type="button">
                                            Add buyer
                                        </SecondaryButton>
                                    </Link>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                                <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <h3 className="text-foreground font-semibold">
                                        Recent invoices
                                    </h3>
                                    <Link
                                        href={route('invoices.index')}
                                        className="font-medium text-sidebar-primary hover:opacity-80 text-sm"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {summary.recent_invoices.length === 0 ? (
                                    <p className="text-muted-foreground p-6 text-center text-sm">
                                        No invoices yet.{' '}
                                        <Link
                                            href={route('invoices.create')}
                                            className="font-medium text-sidebar-primary hover:opacity-80"
                                        >
                                            Create your first invoice
                                        </Link>
                                    </p>
                                ) : (
                                    <>
                                        <ul className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">
                                            {summary.recent_invoices.map(
                                                (row, index) => (
                                                    <li
                                                        key={row.id}
                                                        className="px-4 py-3"
                                                    >
                                                        <div className="mb-1">
                                                            <ListingIndex
                                                                index={index}
                                                                variant="mobile"
                                                            />
                                                        </div>
                                                        <Link
                                                            href={route(
                                                                'invoices.edit',
                                                                row.id,
                                                            )}
                                                            className="font-medium text-sidebar-primary hover:opacity-80 font-medium"
                                                        >
                                                            {
                                                                row.invoice_number
                                                            }
                                                        </Link>
                                                        <p className="text-muted-foreground mt-1 text-sm">
                                                            {row.buyer_name ??
                                                                'No buyer'}{' '}
                                                            · {row.invoice_date}
                                                        </p>
                                                        <div className="mt-2 flex items-center justify-between">
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusBadgeClass(row.status)}`}
                                                            >
                                                                {row.status}
                                                            </span>
                                                            <span className="text-foreground text-sm font-medium">
                                                                {formatMoney(
                                                                    row.total,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ),
                                            )}
                                        </ul>

                                        <div className="hidden md:block">
                                            <table className="w-full min-w-full divide-y divide-border text-sm">
                                                <thead className="bg-muted">
                                                    <tr>
                                                        <th
                                                            className={
                                                                listingIndexThClass
                                                            }
                                                        >
                                                            #
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                            Number
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                            Buyer
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                            Date
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                            Status
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">
                                                            Total
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {summary.recent_invoices.map(
                                                        (row, index) => (
                                                            <tr key={row.id}>
                                                                <ListingIndex
                                                                    index={
                                                                        index
                                                                    }
                                                                />
                                                                <td className="px-4 py-3 font-medium text-foreground">
                                                                    {
                                                                        row.invoice_number
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {row.buyer_name ??
                                                                        '—'}
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {
                                                                        row.invoice_date
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    <span
                                                                        className={statusBadgeClass(
                                                                            row.status,
                                                                        )}
                                                                    >
                                                                        {
                                                                            row.status
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground text-right">
                                                                    {formatMoney(
                                                                        row.total,
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground text-right">
                                                                    <Link
                                                                        href={route(
                                                                            'invoices.edit',
                                                                            row.id,
                                                                        )}
                                                                        className="font-medium text-sidebar-primary hover:opacity-80"
                                                                    >
                                                                        Edit
                                                                    </Link>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
