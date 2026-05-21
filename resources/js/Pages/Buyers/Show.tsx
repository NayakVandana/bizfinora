import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { BuyerOption } from '@/Pages/Invoices/types';
import BuyerDetail from './BuyerDetail';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Props = {
    buyerId: number;
};

export default function BuyersShow({ buyerId }: Props) {
    const [buyer, setBuyer] = useState<BuyerOption | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        void companyApiPost<ApiEnvelope<BuyerOption>>('/buyers/buyer-show', {
            id: buyerId,
        }).then((res) => {
            if (res.success && res.data) {
                setBuyer(res.data);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        });
    }, [buyerId]);

    const title = buyer?.company_name?.trim() || buyer?.name || 'Buyer';

    return (
        <AuthenticatedLayout
            header={
                <h2 className="truncate text-xl font-semibold text-gray-800">
                    {loading ? 'Buyer details' : title}
                </h2>
            }
        >
            <Head title={loading ? 'Buyer details' : title} />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('buyers.index')}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to buyers
                    </Link>

                    {loading ? (
                        <p className="mt-6 text-center text-gray-500">
                            Loading…
                        </p>
                    ) : notFound || !buyer ? (
                        <p className="mt-6 text-center text-gray-600">
                            Buyer not found.
                        </p>
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {title}
                                </h3>
                                {buyer.company_name?.trim() &&
                                buyer.name?.trim() ? (
                                    <p className="mt-1 text-sm text-gray-600">
                                        Contact: {buyer.name}
                                    </p>
                                ) : null}
                            </div>

                            <div className="px-4 py-2 sm:px-6">
                                <BuyerDetail buyer={buyer} />
                            </div>

                            <div className="flex flex-col gap-2 border-t border-gray-200 px-4 py-4 sm:flex-row sm:px-6">
                                <Link
                                    href={route('buyers.edit', buyer.id)}
                                    className="inline-flex w-full sm:w-auto"
                                >
                                    <PrimaryButton
                                        type="button"
                                        className="w-full justify-center"
                                    >
                                        Edit buyer
                                    </PrimaryButton>
                                </Link>
                                <Link
                                    href={route('buyers.index')}
                                    className="inline-flex w-full sm:w-auto"
                                >
                                    <SecondaryButton
                                        type="button"
                                        className="w-full justify-center"
                                    >
                                        Back to list
                                    </SecondaryButton>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
