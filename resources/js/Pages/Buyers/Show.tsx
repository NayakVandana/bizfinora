import AppInvoicesListPanel from '@/Components/AppInvoicesListPanel';
import AdminTabs, { AdminTabPanel } from '@/Components/admin/AdminTabs';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import {
    BUYER_CUSTOMER_LABEL,
    BUYERS_CUSTOMERS_LABEL,
} from '@/constants/buyerLabels';
import type { BuyerOption } from '@/Pages/Invoices/types';
import BuyerDetail from './BuyerDetail';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type BuyerTab = 'profile' | 'invoices';

type Props = {
    buyerId: number;
};

export default function BuyersShow({ buyerId }: Props) {
    const [buyer, setBuyer] = useState<BuyerOption | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<BuyerTab>('profile');

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

    const title =
        buyer?.company_name?.trim() || buyer?.name || BUYER_CUSTOMER_LABEL;

    const tabs = buyer
        ? [
              { id: 'profile' as const, label: 'Profile' },
              {
                  id: 'invoices' as const,
                  label: 'Invoices',
                  count: buyer.invoices_count ?? 0,
              },
          ]
        : [];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground truncate text-xl font-semibold">
                    {loading ? `${BUYER_CUSTOMER_LABEL} details` : title}
                </h2>
            }
        >
            <Head
                title={
                    loading ? `${BUYER_CUSTOMER_LABEL} details` : title
                }
            />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('buyers.index')}
                        className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1 text-sm"
                    >
                        ← Back to {BUYERS_CUSTOMERS_LABEL.toLowerCase()}
                    </Link>

                    {loading ? (
                        <p className="text-muted-foreground mt-6 text-center text-sm">
                            Loading…
                        </p>
                    ) : notFound || !buyer ? (
                        <p className="text-muted-foreground mt-6 text-center text-sm">
                            {BUYER_CUSTOMER_LABEL} not found.
                        </p>
                    ) : (
                        <div className="mt-6">
                            {buyer.company_name?.trim() &&
                            buyer.name?.trim() ? (
                                <p className="text-muted-foreground mb-4 text-sm">
                                    Contact: {buyer.name}
                                </p>
                            ) : null}

                            <AdminTabs
                                tabs={tabs}
                                active={activeTab}
                                onChange={setActiveTab}
                                ariaLabel={`${BUYER_CUSTOMER_LABEL} detail tabs`}
                            />

                            <AdminTabPanel active={activeTab} id="profile">
                                <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                                    <div className="px-4 py-2 sm:px-6">
                                        <BuyerDetail buyer={buyer} />
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-border px-4 py-4 sm:flex-row sm:px-6">
                                        <Link
                                            href={route(
                                                'buyers.edit',
                                                buyer.id,
                                            )}
                                            className="inline-flex w-full sm:w-auto"
                                        >
                                            <PrimaryButton
                                                type="button"
                                                className="w-full justify-center"
                                            >
                                                Edit {BUYER_CUSTOMER_LABEL.toLowerCase()}
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
                            </AdminTabPanel>

                            <AdminTabPanel active={activeTab} id="invoices">
                                <AppInvoicesListPanel
                                    buyerId={buyer.id}
                                    emptyMessage={`No invoices for this ${BUYER_CUSTOMER_LABEL.toLowerCase()} yet.`}
                                />
                            </AdminTabPanel>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
