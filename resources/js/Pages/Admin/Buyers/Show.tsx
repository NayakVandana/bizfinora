import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import BuyerDetail from '@/Pages/Buyers/BuyerDetail';
import { adminApiPost, type ApiEnvelope } from '@/api/adminClient';
import type { AdminBuyerDetail } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AdminBuyerShow({ buyerId }: { buyerId: number }) {
    const [buyer, setBuyer] = useState<AdminBuyerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        void adminApiPost<ApiEnvelope<AdminBuyerDetail>>('/buyers/buyer-show', {
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
    const backHref = buyer?.company
        ? route('admin.companies.show', buyer.company.id)
        : route('admin.companies.index');
    const backLabel = buyer?.company
        ? `← Back to ${buyer.company.name}`
        : '← Back to companies';

    return (
        <AdminLayout
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
                        href={backHref}
                        className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1 text-sm"
                    >
                        {backLabel}
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
                                {buyer.company ? (
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        Company:{' '}
                                        <Link
                                            href={route(
                                                'admin.companies.show',
                                                buyer.company.id,
                                            )}
                                            className="font-medium text-sidebar-primary hover:opacity-80"
                                        >
                                            {buyer.company.name}
                                        </Link>
                                    </p>
                                ) : null}
                            </div>

                            <div className="px-4 py-2 sm:px-6">
                                <BuyerDetail buyer={buyer} />
                            </div>

                            <div className="flex flex-col gap-2 border-t border-border px-4 py-4 sm:flex-row sm:px-6">
                                <Link
                                    href={backHref}
                                    className="inline-flex w-full sm:w-auto"
                                >
                                    <SecondaryButton
                                        type="button"
                                        className="w-full justify-center"
                                    >
                                        Back to company
                                    </SecondaryButton>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
