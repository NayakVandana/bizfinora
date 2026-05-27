import ListingIndex from '@/Components/ListingIndex';
import BuyerListingActions from '@/Components/BuyerListingActions';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatDisplayDateTime } from '@/utils/formatDisplayDate';
import { listingIndexThClass } from '@/utils/listingIndex';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { useConfirm } from '@/contexts/ConfirmDialogContext';
import {
    BUYER_CUSTOMER_LABEL,
    BUYERS_CUSTOMERS_LABEL,
} from '@/constants/buyerLabels';
import type { BuyerOption } from '@/Pages/Invoices/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function buyerLabel(b: BuyerOption): string {
    return b.company_name?.trim() || b.name;
}

export default function BuyersIndex() {
    const { confirm } = useConfirm();
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
        const ok = await confirm({
            title: `Delete ${BUYER_CUSTOMER_LABEL.toLowerCase()}?`,
            message: `This ${BUYER_CUSTOMER_LABEL.toLowerCase()} will be permanently removed.`,
            confirmLabel: 'Delete',
            variant: 'danger',
        });

        if (!ok) {
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
                <h2 className="text-foreground text-xl font-semibold">
                    {BUYERS_CUSTOMERS_LABEL}
                </h2>
            }
        >
            <Head title={BUYERS_CUSTOMERS_LABEL} />

            <div className="py-6">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-muted-foreground text-sm">
                                Saved {BUYERS_CUSTOMERS_LABEL.toLowerCase()} for invoices
                            </p>
                            <Link href={route('buyers.create')}>
                                <PrimaryButton className="w-full justify-center sm:w-auto">
                                    New {BUYER_CUSTOMER_LABEL.toLowerCase()}
                                </PrimaryButton>
                            </Link>
                        </div>

                        {loading ? (
                            <p className="text-muted-foreground p-6 text-center">
                                Loading…
                            </p>
                        ) : buyers.length === 0 ? (
                            <p className="text-muted-foreground p-6 text-center">
                                No {BUYERS_CUSTOMERS_LABEL.toLowerCase()} yet.{' '}
                                <Link
                                    href={route('buyers.create')}
                                    className="font-medium text-sidebar-primary hover:opacity-80"
                                >
                                    Create one
                                </Link>
                            </p>
                        ) : (
                            <>
                                {/* Mobile cards */}
                                <ul className="divide-y divide-gray-100 md:hidden dark:divide-gray-800">
                                    {buyers.map((b, index) => (
                                        <li
                                            key={b.id}
                                            className="px-4 py-4"
                                        >
                                            <div className="mb-1">
                                                <ListingIndex
                                                    index={index}
                                                    variant="mobile"
                                                />
                                            </div>
                                            <Link
                                                href={route(
                                                    'buyers.show',
                                                    b.id,
                                                )}
                                                className="font-medium text-sidebar-primary hover:opacity-80 font-medium"
                                            >
                                                {buyerLabel(b)}
                                            </Link>
                                            <dl className="text-muted-foreground mt-2 space-y-1 text-sm">
                                                {b.name &&
                                                b.company_name?.trim() ? (
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            Owner:{' '}
                                                        </span>
                                                        {b.name}
                                                    </div>
                                                ) : null}
                                                {b.phone ? (
                                                    <div>{b.phone}</div>
                                                ) : null}
                                                {b.email ? (
                                                    <div className="truncate">
                                                        {b.email}
                                                    </div>
                                                ) : null}
                                                {b.gst ? (
                                                    <div>GST: {b.gst}</div>
                                                ) : null}
                                                {b.created_at ? (
                                                    <div>
                                                        {formatDisplayDateTime(
                                                            b.created_at,
                                                        )}
                                                    </div>
                                                ) : null}
                                            </dl>
                                            <div className="mt-3">
                                                <BuyerListingActions
                                                    buyerId={b.id}
                                                    onDelete={() =>
                                                        void destroy(b.id)
                                                    }
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* Desktop table */}
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
                                                    Company
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Owner
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Mobile
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    GST
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                    Created
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {buyers.map((b, index) => (
                                                <tr key={b.id}>
                                                    <ListingIndex
                                                        index={index}
                                                    />
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={route(
                                                                'buyers.show',
                                                                b.id,
                                                            )}
                                                            className="font-medium text-sidebar-primary hover:opacity-80"
                                                        >
                                                            {buyerLabel(b)}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {b.name ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {b.phone ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {b.email ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {b.gst ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                        {formatDisplayDateTime(
                                                            b.created_at,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <BuyerListingActions
                                                            buyerId={b.id}
                                                            onDelete={() =>
                                                                void destroy(
                                                                    b.id,
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
