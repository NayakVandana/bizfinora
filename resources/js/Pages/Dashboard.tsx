import ListingIndex from '@/Components/ListingIndex';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { listingIndexThClass } from '@/utils/listingIndex';
import { useAuthUser } from '@/auth/useAuthUser';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { formatMoney } from '@/invoices/formatMoney';
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

function statusBadgeClass(status: string): string {
    switch (status) {
        case 'paid':
            return 'bg-green-100 text-green-800';
        case 'sent':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

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
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            {sub ? (
                <p className="mt-1 text-sm text-gray-600">{sub}</p>
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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-3 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
                        <p className="text-lg text-gray-900">
                            Welcome, <strong>{user?.name}</strong>
                        </p>
                        {currentCompany ? (
                            <p className="mt-1 text-sm text-gray-600">
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
                            <p className="mt-2 text-sm text-amber-800">
                                Select or create a company to use invoices and
                                buyers.{' '}
                                <Link
                                    href={route('companies.index')}
                                    className="font-medium underline"
                                >
                                    Manage companies
                                </Link>
                            </p>
                        )}
                    </div>

                    {!currentCompany ? null : loading ? (
                        <p className="text-center text-sm text-gray-500">
                            Loading summary…
                        </p>
                    ) : error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                    Quick actions
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {quickLinks.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={route(item.href)}
                                            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                                        >
                                            <p className="font-semibold text-gray-900">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-600">
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

                            <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                                <div className="flex flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                    <h3 className="font-semibold text-gray-900">
                                        Recent invoices
                                    </h3>
                                    <Link
                                        href={route('invoices.index')}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {summary.recent_invoices.length === 0 ? (
                                    <p className="p-6 text-center text-sm text-gray-500">
                                        No invoices yet.{' '}
                                        <Link
                                            href={route('invoices.create')}
                                            className="font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            Create your first invoice
                                        </Link>
                                    </p>
                                ) : (
                                    <>
                                        <ul className="divide-y divide-gray-100 md:hidden">
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
                                                            className="font-medium text-indigo-600"
                                                        >
                                                            {
                                                                row.invoice_number
                                                            }
                                                        </Link>
                                                        <p className="mt-1 text-sm text-gray-600">
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
                                                            <span className="text-sm font-medium text-gray-900">
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
                                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th
                                                            className={
                                                                listingIndexThClass
                                                            }
                                                        >
                                                            #
                                                        </th>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                                                            Number
                                                        </th>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                                                            Buyer
                                                        </th>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                                                            Date
                                                        </th>
                                                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                                                            Status
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-medium text-gray-600">
                                                            Total
                                                        </th>
                                                        <th className="px-4 py-3 text-right font-medium text-gray-600">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {summary.recent_invoices.map(
                                                        (row, index) => (
                                                            <tr key={row.id}>
                                                                <ListingIndex
                                                                    index={
                                                                        index
                                                                    }
                                                                />
                                                                <td className="px-4 py-3 font-medium">
                                                                    {
                                                                        row.invoice_number
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600">
                                                                    {row.buyer_name ??
                                                                        '—'}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-600">
                                                                    {
                                                                        row.invoice_date
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span
                                                                        className={`rounded-full px-2 py-0.5 text-xs capitalize ${statusBadgeClass(row.status)}`}
                                                                    >
                                                                        {
                                                                            row.status
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    {formatMoney(
                                                                        row.total,
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <Link
                                                                        href={route(
                                                                            'invoices.edit',
                                                                            row.id,
                                                                        )}
                                                                        className="text-indigo-600 hover:text-indigo-800"
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
