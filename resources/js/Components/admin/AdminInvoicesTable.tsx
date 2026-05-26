import ListingIndex from '@/Components/ListingIndex';
import InvoiceStatusBadge from '@/Components/InvoiceStatusBadge';
import { listingIndexThClass } from '@/utils/listingIndex';
import { formatMoney } from '@/invoices/formatMoney';
import type { AdminInvoiceRow } from '@/types/admin';
import { Link } from '@inertiajs/react';

const compactTh =
    'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground';
const compactTd = 'px-3 py-2 text-sm';

function formatDateTime(value?: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

type Props = {
    rows: AdminInvoiceRow[];
    showCompany?: boolean;
};

export default function AdminInvoicesTable({
    rows,
    showCompany = true,
}: Props) {
    if (rows.length === 0) {
        return (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                No invoices found.
            </p>
        );
    }

    return (
        <>
            <ul className="divide-y divide-border lg:hidden">
                {rows.map((row, index) => (
                    <li key={row.id} className="px-4 py-2.5">
                        <ListingIndex index={index} variant="mobile" />
                        {showCompany && row.company_name ? (
                            <Link
                                href={route(
                                    'admin.companies.show',
                                    row.company_id,
                                )}
                                className="text-muted-foreground text-xs hover:text-foreground"
                            >
                                {row.company_name}
                            </Link>
                        ) : null}
                        <p className="text-foreground text-sm font-medium">
                            {row.invoice_number}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            {row.buyer_company_name?.trim() || row.buyer_name || '—'}
                            {row.buyer_name &&
                            row.buyer_company_name?.trim() &&
                            row.buyer_name !== row.buyer_company_name
                                ? ` · ${row.buyer_name}`
                                : ''}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <InvoiceStatusBadge status={row.status} />
                            <span className="text-foreground text-sm font-medium">
                                {formatMoney(row.total, row.currency)}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[56rem] divide-y divide-border text-sm">
                    <thead className="bg-muted">
                        <tr>
                            <th className={listingIndexThClass}>#</th>
                            {showCompany ? (
                                <th className={compactTh}>Company</th>
                            ) : null}
                            <th className={compactTh}>Invoice</th>
                            <th className={compactTh}>Buyer company</th>
                            <th className={compactTh}>Buyer name</th>
                            <th className={compactTh}>Mobile</th>
                            <th className={compactTh}>Date</th>
                            <th className={compactTh}>Status</th>
                            <th className={`${compactTh} text-right`}>Total</th>
                            {showCompany ? (
                                <th className={`${compactTh} text-right`}>
                                    Action
                                </th>
                            ) : null}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {rows.map((row, index) => (
                            <tr key={row.id}>
                                <ListingIndex index={index} />
                                {showCompany ? (
                                    <td className={`${compactTd} text-muted-foreground`}>
                                        {row.company_name ? (
                                            <Link
                                                href={route(
                                                    'admin.companies.show',
                                                    row.company_id,
                                                )}
                                                className="text-sidebar-primary hover:opacity-80"
                                            >
                                                {row.company_name}
                                            </Link>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                ) : null}
                                <td className={`${compactTd} font-medium text-foreground`}>
                                    {row.invoice_number}
                                </td>
                                <td className={`${compactTd} text-muted-foreground`}>
                                    {row.buyer_company_name?.trim() || '—'}
                                </td>
                                <td className={`${compactTd} text-muted-foreground`}>
                                    {row.buyer_id ? (
                                        <Link
                                            href={route(
                                                'admin.buyers.show',
                                                row.buyer_id,
                                            )}
                                            className="text-sidebar-primary hover:opacity-80"
                                        >
                                            {row.buyer_name ?? '—'}
                                        </Link>
                                    ) : (
                                        row.buyer_name ?? '—'
                                    )}
                                </td>
                                <td className={`${compactTd} text-muted-foreground`}>
                                    {row.buyer_phone ?? '—'}
                                </td>
                                <td className={`${compactTd} text-muted-foreground whitespace-nowrap`}>
                                    {formatDateTime(row.created_at ?? row.invoice_date)}
                                </td>
                                <td className={compactTd}>
                                    <InvoiceStatusBadge status={row.status} />
                                </td>
                                <td className={`${compactTd} text-right font-medium text-foreground`}>
                                    {formatMoney(row.total, row.currency)}
                                </td>
                                {showCompany ? (
                                    <td className={`${compactTd} text-right`}>
                                        <Link
                                            href={route(
                                                'admin.companies.show',
                                                row.company_id,
                                            )}
                                            className="font-medium text-sidebar-primary hover:opacity-80"
                                        >
                                            View
                                        </Link>
                                    </td>
                                ) : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
