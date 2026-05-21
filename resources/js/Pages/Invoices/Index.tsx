import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type InvoiceRow = {
    id: number;
    invoice_number: string;
    status: string;
    issue_date: string;
    due_date?: string;
    currency: string;
    total: number;
    buyer_name?: string;
    has_share_link: boolean;
};

type Paginated = {
    data: InvoiceRow[];
};

export default function InvoicesIndex() {
    const [rows, setRows] = useState<InvoiceRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        companyApiPost<ApiEnvelope<Paginated>>('/invoices/invoices-list', {})
            .then((res) => {
                if (res.success && res.data?.data) {
                    setRows(res.data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Invoices
                    </h2>
                    <Link href={route('invoices.create')}>
                        <PrimaryButton>New invoice</PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Invoices" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        {loading ? (
                            <p className="p-6 text-gray-500">Loading…</p>
                        ) : rows.length === 0 ? (
                            <p className="p-6 text-gray-500">
                                No invoices yet.{' '}
                                <Link
                                    href={route('invoices.create')}
                                    className="text-indigo-600 underline"
                                >
                                    Create your first invoice
                                </Link>
                                .
                            </p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Buyer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                                            Total
                                        </th>
                                        <th className="px-4 py-3" />
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {rows.map((row) => (
                                        <tr key={row.id}>
                                            <td className="px-4 py-3 font-medium">
                                                {row.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {row.buyer_name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {row.issue_date}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs capitalize">
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {row.currency}{' '}
                                                {row.total.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={route(
                                                        'invoices.edit',
                                                        row.id,
                                                    )}
                                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
