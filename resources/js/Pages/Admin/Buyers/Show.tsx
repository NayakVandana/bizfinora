import AdminInvoicesListPanel from '@/Components/admin/AdminInvoicesListPanel';
import AdminTabs, { AdminTabPanel } from '@/Components/admin/AdminTabs';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import BuyerDetail from '@/Pages/Buyers/BuyerDetail';
import { adminApiPost, type ApiEnvelope } from '@/api/adminClient';
import {
    BUYER_CUSTOMER_LABEL,
    BUYERS_CUSTOMERS_LABEL,
} from '@/constants/buyerLabels';
import type { AdminBuyerDetail } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type BuyerTab = 'profile' | 'invoices';

export default function AdminBuyerShow({ buyerId }: { buyerId: number }) {
    const [buyer, setBuyer] = useState<AdminBuyerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState<BuyerTab>('profile');

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

    const title =
        buyer?.company_name?.trim() || buyer?.name || BUYER_CUSTOMER_LABEL;
    const backHref = buyer?.company
        ? route('admin.companies.show', buyer.company.id)
        : route('admin.companies.index');
    const backLabel = buyer?.company
        ? `← Back to ${buyer.company.name}`
        : '← Back to companies';

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
        <AdminLayout
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
                            {BUYER_CUSTOMER_LABEL} not found.
                        </p>
                    ) : (
                        <div className="mt-6">
                            {buyer.company ? (
                                <p className="text-muted-foreground mb-4 text-sm">
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
                            </AdminTabPanel>

                            <AdminTabPanel active={activeTab} id="invoices">
                                <AdminInvoicesListPanel
                                    buyerId={buyer.id}
                                    companyId={buyer.company_id}
                                    showCompany={false}
                                    showBuyer={false}
                                />
                            </AdminTabPanel>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
