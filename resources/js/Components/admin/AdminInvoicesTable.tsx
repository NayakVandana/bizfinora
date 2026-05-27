import ListingIndex from '@/Components/ListingIndex';
import InvoiceListingActions from '@/Components/InvoiceListingActions';
import InvoiceStatusBadge from '@/Components/InvoiceStatusBadge';
import { listingIndexThClass } from '@/utils/listingIndex';
import {
    adminApiPost,
    type ApiEnvelope,
} from '@/api/adminClient';
import {
    companyContextFromMeta,
    mergeCompanyContextIntoDraft,
} from '@/invoices/companyContext';
import { invoicePayloadToDraft } from '@/invoices/defaultDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import { formatMoney } from '@/invoices/formatMoney';
import type { InvoiceDraft } from '@/invoices/types';
import type { AdminInvoiceRow } from '@/types/admin';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const compactTh =
    'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground';
const compactTd = 'px-3 py-2 text-sm';

import {
    BUYER_CUSTOMER_COMPANY_LABEL,
    BUYER_CUSTOMER_NAME_LABEL,
} from '@/constants/buyerLabels';
import { formatDisplayDateTime } from '@/utils/formatDisplayDate';

type Props = {
    rows: AdminInvoiceRow[];
    showCompany?: boolean;
    showBuyer?: boolean;
};

export default function AdminInvoicesTable({
    rows,
    showCompany = true,
    showBuyer = true,
}: Props) {
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [sharingId, setSharingId] = useState<number | null>(null);
    const [shareLinkIds, setShareLinkIds] = useState<Set<number>>(new Set());
    const [shareMessage, setShareMessage] = useState<string | null>(null);

    const hasShareLink = (row: AdminInvoiceRow) =>
        row.has_share_link || shareLinkIds.has(row.id);

    const loadInvoiceDraft = async (id: number): Promise<InvoiceDraft | null> => {
        const res = await adminApiPost<
            ApiEnvelope<InvoiceDraft & { id: number }>
        >('/invoices/invoice-show', { id });

        if (!res.success || !res.data) {
            return null;
        }

        const payload = res.data as unknown as Record<string, unknown>;

        return mergeCompanyContextIntoDraft(
            invoicePayloadToDraft(payload),
            companyContextFromMeta(payload),
        );
    };

    const downloadInvoice = async (id: number) => {
        setSharingId(null);
        setShareMessage(null);
        setDownloadingId(id);
        try {
            const draft = await loadInvoiceDraft(id);
            if (draft) {
                await downloadInvoicePdf(draft);
            }
        } finally {
            setDownloadingId(null);
        }
    };

    const createShareLink = async (id: number) => {
        setDownloadingId(null);
        setShareMessage(null);
        setSharingId(id);
        try {
            const res = await adminApiPost<
                ApiEnvelope<{ share_url: string }>
            >('/invoices/invoice-share-enable', { id });

            if (res.success && res.data?.share_url) {
                setShareLinkIds((prev) => new Set(prev).add(id));

                try {
                    await navigator.clipboard.writeText(res.data.share_url);
                    setShareMessage('Share link copied to clipboard.');
                } catch {
                    setShareMessage(res.data.share_url);
                }
            }
        } finally {
            setSharingId(null);
        }
    };

    const renderRowActions = (row: AdminInvoiceRow) => (
        <InvoiceListingActions
            row={row}
            variant="admin"
            downloadingId={downloadingId}
            sharingId={sharingId}
            onDownload={downloadInvoice}
            onShare={createShareLink}
            hasShareLink={hasShareLink}
        />
    );

    if (rows.length === 0) {
        return (
            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                No invoices found.
            </p>
        );
    }

    return (
        <>
            {shareMessage ? (
                <div className="border-b border-border bg-muted/40 px-4 py-2 text-sm text-foreground">
                    {shareMessage}
                </div>
            ) : null}

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
                        {row.user_name ? (
                            <p className="text-muted-foreground text-xs">
                                {row.user_id ? (
                                    <Link
                                        href={route(
                                            'admin.users.show',
                                            row.user_id,
                                        )}
                                        className="hover:text-foreground"
                                    >
                                        {row.user_name}
                                    </Link>
                                ) : (
                                    row.user_name
                                )}
                            </p>
                        ) : null}
                        <Link
                            href={route('admin.invoices.show', row.id)}
                            className="text-foreground text-sm font-medium hover:text-sidebar-primary"
                        >
                            {row.invoice_number}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                            {showBuyer
                                ? row.buyer_company_name?.trim() ||
                                  row.buyer_name ||
                                  '—'
                                : null}
                            {showBuyer &&
                            row.buyer_name &&
                            row.buyer_company_name?.trim() &&
                            row.buyer_name !== row.buyer_company_name
                                ? ` · ${row.buyer_name}`
                                : ''}
                        </p>
                        <p className="text-muted-foreground text-xs">
                            {formatDisplayDateTime(row.created_at)}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <InvoiceStatusBadge status={row.status} />
                            <span className="text-foreground text-sm font-medium">
                                {formatMoney(row.total, row.currency)}
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                            {renderRowActions(row)}
                        </div>
                    </li>
                ))}
            </ul>

            <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[62rem] divide-y divide-border text-sm">
                    <thead className="bg-muted">
                        <tr>
                            <th className={listingIndexThClass}>#</th>
                            {showCompany ? (
                                <th className={compactTh}>Company</th>
                            ) : null}
                            <th className={compactTh}>User</th>
                            <th className={compactTh}>Invoice</th>
                            {showBuyer ? (
                                <>
                                    <th className={compactTh}>
                                        {BUYER_CUSTOMER_COMPANY_LABEL}
                                    </th>
                                    <th className={compactTh}>
                                        {BUYER_CUSTOMER_NAME_LABEL}
                                    </th>
                                    <th className={compactTh}>Mobile</th>
                                </>
                            ) : null}
                            <th className={compactTh}>Created</th>
                            <th className={compactTh}>Status</th>
                            <th className={`${compactTh} text-right`}>Total</th>
                            <th className={`${compactTh} text-right`}>Action</th>
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
                                <td className={`${compactTd} text-muted-foreground`}>
                                    {row.user_id && row.user_name ? (
                                        <Link
                                            href={route(
                                                'admin.users.show',
                                                row.user_id,
                                            )}
                                            className="text-sidebar-primary hover:opacity-80"
                                        >
                                            {row.user_name}
                                        </Link>
                                    ) : (
                                        row.user_name ?? '—'
                                    )}
                                </td>
                                <td className={`${compactTd} font-medium text-foreground`}>
                                    <Link
                                        href={route('admin.invoices.show', row.id)}
                                        className="text-sidebar-primary hover:opacity-80"
                                    >
                                        {row.invoice_number}
                                    </Link>
                                </td>
                                {showBuyer ? (
                                    <>
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
                                    </>
                                ) : null}
                                <td className={`${compactTd} text-muted-foreground whitespace-nowrap`}>
                                    {formatDisplayDateTime(row.created_at)}
                                </td>
                                <td className={compactTd}>
                                    <InvoiceStatusBadge status={row.status} />
                                </td>
                                <td className={`${compactTd} text-right font-medium text-foreground`}>
                                    {formatMoney(row.total, row.currency)}
                                </td>
                                <td className={`${compactTd} text-right text-sm`}>
                                    {renderRowActions(row)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
