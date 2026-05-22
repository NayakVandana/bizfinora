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
                <h2 className="text-foreground truncate text-xl font-semibold">
                    {loading ? 'Buyer details' : title}
                </h2>
            }
        >
            <Head title={loading ? 'Buyer details' : title} />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('buyers.index')}
                        className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1 text-sm"
                    >
                        ← Back to buyers
                    </Link>

                    {loading ? (
                        <p className="text-muted-foreground mt-6 text-center text-sm">
                            Loading…
                        </p>
                    ) : notFound || !buyer ? (
                        <p className="text-muted-foreground mt-6 text-center text-sm">
                            Buyer not found.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm mt-6">
                            <div className="border-b border-border px-4 py-4 sm:px-6">
                                <h3 className="text-foreground text-lg font-semibold">
                                    {title}
                                </h3>
                                {buyer.company_name?.trim() &&
                                buyer.name?.trim() ? (
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Contact: {buyer.name}
                                    </p>
                                ) : null}
                            </div>

                            <div className="px-4 py-2 sm:px-6">
                                <BuyerDetail buyer={buyer} />
                            </div>

                            <div className="flex flex-col gap-2 border-t border-border px-4 py-4 sm:flex-row sm:px-6">
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
