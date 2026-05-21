import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { BuyerOption } from '@/Pages/Invoices/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function BuyersIndex() {
    const [buyers, setBuyers] = useState<BuyerOption[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        const res = await companyApiPost<ApiEnvelope<BuyerOption[]>>(
            '/buyers/buyers-list',
            {},
        );
        if (res.success && res.data) {
            setBuyers(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        void load();
    }, []);

    const destroy = async (id: number) => {
        if (!confirm('Delete this buyer?')) {
            return;
        }
        const res = await companyApiPost<ApiEnvelope<null>>(
            '/buyers/buyer-destroy',
            { id },
        );
        if (res.success) {
            await load();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">Buyers</h2>
            }
        >
            <Head title="Buyers" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-sm text-gray-600">
                                Saved buyers for invoices
                            </p>
                            <Link href={route('buyers.create')}>
                                <PrimaryButton>New buyer</PrimaryButton>
                            </Link>
                        </div>

                        {loading ? (
                            <p className="p-6 text-center text-gray-500">
                                Loading…
                            </p>
                        ) : buyers.length === 0 ? (
                            <p className="p-6 text-center text-gray-500">
                                No buyers yet.{' '}
                                <Link
                                    href={route('buyers.create')}
                                    className="font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                    Create one
                                </Link>
                            </p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                                            Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-600">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {buyers.map((b) => (
                                        <tr key={b.id}>
                                            <td className="px-4 py-3">
                                                {b.name}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {b.email ?? '—'}
                                            </td>
                                            <td className="space-x-2 px-4 py-3 text-right">
                                                <Link
                                                    href={route(
                                                        'buyers.edit',
                                                        b.id,
                                                    )}
                                                    className="text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="text-red-600 hover:text-red-800"
                                                    onClick={() =>
                                                        void destroy(b.id)
                                                    }
                                                >
                                                    Delete
                                                </button>
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
