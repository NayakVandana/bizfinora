import AdminInvoicesTable from '@/Components/admin/AdminInvoicesTable';
import InvoiceStatusSummaryBar from '@/Components/InvoiceStatusSummaryBar';
import ListingPagination from '@/Components/ListingPagination';
import { LISTING_PER_PAGE } from '@/utils/listingIndex';
import {
    adminApiPost,
    type ApiEnvelope,
} from '@/api/adminClient';
import type { AdminInvoiceRow } from '@/types/admin';
import type {
    InvoiceStatusFilter,
    InvoiceSummary,
    PaginatedWithInvoiceSummary,
} from '@/types/invoiceSummary';
import { useCallback, useEffect, useState } from 'react';

const emptySummary: InvoiceSummary = {
    total: 0,
    all: { count: 0, amount: 0 },
    draft: { count: 0, amount: 0 },
    sent: { count: 0, amount: 0 },
    unpaid: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
};

type Props = {
    companyId?: number;
    buyerId?: number;
    showCompany?: boolean;
    showBuyer?: boolean;
};

export default function AdminInvoicesListPanel({
    companyId,
    buyerId,
    showCompany = companyId === undefined && buyerId === undefined,
    showBuyer = buyerId === undefined,
}: Props) {
    const [rows, setRows] = useState<AdminInvoiceRow[]>([]);
    const [summary, setSummary] = useState<InvoiceSummary>(emptySummary);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('all');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: null as number | null,
        to: null as number | null,
    });

    const load = useCallback(async () => {
        setLoading(true);

        const res = await adminApiPost<
            ApiEnvelope<PaginatedWithInvoiceSummary<AdminInvoiceRow>>
        >('/invoices/invoices-list', {
            per_page: LISTING_PER_PAGE,
            current_page: page,
            company_id: companyId,
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
    }, [buyerId, companyId, page, statusFilter]);

    useEffect(() => {
        void load();
    }, [load]);

    const handleStatusChange = (status: InvoiceStatusFilter) => {
        setPage(1);
        setStatusFilter(status);
    };

    if (loading) {
        return (
            <p className="text-muted-foreground text-center text-sm">
                Loading…
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
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
                        ? 'No invoices found.'
                        : 'No invoices match this filter.'}
                </p>
            ) : (
                <>
                    <AdminInvoicesTable
                        rows={rows}
                        showCompany={showCompany}
                        showBuyer={showBuyer}
                    />
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
