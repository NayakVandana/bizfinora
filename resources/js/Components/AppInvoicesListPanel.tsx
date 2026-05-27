import ListingIndex from '@/Components/ListingIndex';
import ListingPagination from '@/Components/ListingPagination';
import InvoiceListingActions from '@/Components/InvoiceListingActions';
import InvoiceStatusSummaryBar from '@/Components/InvoiceStatusSummaryBar';
import InvoiceStatusBadge from '@/Components/InvoiceStatusBadge';
import { listingIndexThClass, LISTING_PER_PAGE } from '@/utils/listingIndex';
import {
    companyContextFromMeta,
    mergeCompanyContextIntoDraft,
} from '@/invoices/companyContext';
import { invoicePayloadToDraft } from '@/invoices/defaultDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import { formatMoney } from '@/invoices/formatMoney';
import type { InvoiceDraft } from '@/invoices/types';
import { formatDisplayDateTime } from '@/utils/formatDisplayDate';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type {
    InvoiceStatusFilter,
    InvoiceSummary,
    PaginatedWithInvoiceSummary,
} from '@/types/invoiceSummary';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type InvoiceRow = {
    id: number;
    invoice_number: string;
    status: string;
    invoice_date: string;
    due_date?: string;
    currency: string;
    total: number;
    buyer_name?: string;
    has_share_link: boolean;
    created_at?: string | null;
};

const emptySummary: InvoiceSummary = {
    total: 0,
    all: { count: 0, amount: 0 },
    draft: { count: 0, amount: 0 },
    sent: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
};

type Props = {
    buyerId?: number;
    showBuyer?: boolean;
    emptyMessage?: string;
};

export default function AppInvoicesListPanel({
    buyerId,
    showBuyer = buyerId === undefined,
    emptyMessage = 'No invoices found.',
}: Props) {
    const [rows, setRows] = useState<InvoiceRow[]>([]);
    const [summary, setSummary] = useState<InvoiceSummary>(emptySummary);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('all');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: null as number | null,
        to: null as number | null,
    });
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [sharingId, setSharingId] = useState<number | null>(null);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [shareMessage, setShareMessage] = useState<string | null>(null);

    const loadInvoiceDraft = async (id: number): Promise<InvoiceDraft | null> => {
        const res = await companyApiPost<
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
            const res = await companyApiPost<
                ApiEnvelope<{ share_url: string }>
            >('/invoices/invoice-share-enable', { id });

            if (res.success && res.data?.share_url) {
                setRows((prev) =>
                    prev.map((row) =>
                        row.id === id
                            ? { ...row, has_share_link: true }
                            : row,
                    ),
                );

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

    const rejectInvoice = async (id: number) => {
        setShareMessage(null);
        setRejectingId(id);
        try {
            const res = await companyApiPost<ApiEnvelope<null>>(
                '/invoices/invoice-reject',
                { id },
            );

            if (res.success) {
                await load();
            } else {
                setShareMessage(res.message ?? 'Could not reject invoice.');
            }
        } finally {
            setRejectingId(null);
        }
    };

    const load = useCallback(async () => {
        setLoading(true);

        const res = await companyApiPost<
            ApiEnvelope<PaginatedWithInvoiceSummary<InvoiceRow>>
        >('/invoices/invoices-list', {
            per_page: LISTING_PER_PAGE,
            current_page: page,
            buyer_id: buyerId,
            status: statusFilter === 'all' ? undefined : statusFilter,
        });

        if (res.success && res.data) {
            setRows(res.data.data);
            setSummary(res.data.summary ?? emptySummary);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                from: res.data.from,
                to: res.data.to,
            });
        }

        setLoading(false);
    }, [buyerId, page, statusFilter]);

    useEffect(() => {
        void load();
    }, [load]);

    const handleStatusChange = (status: InvoiceStatusFilter) => {
        setPage(1);
        setStatusFilter(status);
    };

    const renderRowActions = (row: InvoiceRow) => (
        <InvoiceListingActions
            row={row}
            variant="app"
            downloadingId={downloadingId}
            sharingId={sharingId}
            rejectingId={rejectingId}
            onDownload={downloadInvoice}
            onShare={createShareLink}
            onReject={rejectInvoice}
        />
    );

    if (loading) {
        return (
            <p className="text-muted-foreground text-center text-sm">
                Loading…
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            {shareMessage ? (
                <div className="border-b border-border bg-muted/40 px-4 py-2 text-sm text-foreground">
                    {shareMessage}
                </div>
            ) : null}

            {summary.total > 0 ? (
                <InvoiceStatusSummaryBar
                    summary={summary}
                    active={statusFilter}
                    onChange={handleStatusChange}
                />
            ) : null}

            {rows.length === 0 ? (
                <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                    {summary.total === 0
                        ? emptyMessage
                        : 'No invoices match this filter.'}
                </p>
            ) : (
                <>
                    <ul className="divide-y divide-border md:hidden">
                        {rows.map((row, index) => (
                            <li key={row.id} className="px-4 py-3">
                                <div className="mb-1">
                                    <ListingIndex
                                        index={index}
                                        variant="mobile"
                                    />
                                </div>
                                <Link
                                    href={route('invoices.show', row.id)}
                                    className="font-medium text-sidebar-primary hover:opacity-80"
                                >
                                    {row.invoice_number}
                                </Link>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {showBuyer && row.buyer_name
                                        ? `${row.buyer_name} · `
                                        : ''}
                                    {formatDisplayDateTime(row.created_at)}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                    <InvoiceStatusBadge status={row.status} />
                                    <span className="text-foreground text-sm font-medium">
                                        {formatMoney(row.total)}
                                    </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                                    {renderRowActions(row)}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <table className="hidden w-full min-w-full divide-y divide-border text-sm md:table">
                        <thead className="bg-muted">
                            <tr>
                                <th className={listingIndexThClass}>#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Number
                                </th>
                                {showBuyer ? (
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                        Buyer
                                    </th>
                                ) : null}
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Created
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">
                                    Total
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((row, index) => (
                                <tr key={row.id}>
                                    <ListingIndex index={index} />
                                    <td className="px-4 py-3 font-medium text-foreground">
                                        <Link
                                            href={route(
                                                'invoices.show',
                                                row.id,
                                            )}
                                            className="text-sidebar-primary hover:opacity-80"
                                        >
                                            {row.invoice_number}
                                        </Link>
                                    </td>
                                    {showBuyer ? (
                                        <td className="px-4 py-3 text-muted-foreground text-sm">
                                            {row.buyer_name ?? '—'}
                                        </td>
                                    ) : null}
                                    <td className="px-4 py-3 text-muted-foreground text-sm">
                                        {formatDisplayDateTime(row.created_at)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        <InvoiceStatusBadge
                                            status={row.status}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-right text-sm">
                                        {formatMoney(row.total)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-right text-sm">
                                        {renderRowActions(row)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <ListingPagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        total={pagination.total}
                        from={pagination.from}
                        to={pagination.to}
                        onPageChange={setPage}
                    />
                </>
            )}
        </div>
    );
}
