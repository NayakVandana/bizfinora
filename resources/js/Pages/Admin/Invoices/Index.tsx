import ListingPagination from '@/Components/ListingPagination';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/AdminLayout';
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
import { Head } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import InvoiceStatusSummaryBar from '@/Components/InvoiceStatusSummaryBar';
import AdminInvoicesTable from '@/Components/admin/AdminInvoicesTable';
import { LISTING_PER_PAGE } from '@/utils/listingIndex';

const emptySummary: InvoiceSummary = {
    total: 0,
    all: { count: 0, amount: 0 },
    draft: { count: 0, amount: 0 },
    sent: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
};

export default function AdminInvoicesIndex() {
    const [rows, setRows] = useState<AdminInvoiceRow[]>([]);
    const [summary, setSummary] = useState<InvoiceSummary>(emptySummary);
    const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>('all');
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
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
            keyword: search || undefined,
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
    }, [page, search, statusFilter]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            setSearch(keyword.trim());
        }, 300);

        return () => window.clearTimeout(timer);
    }, [keyword]);

    const handleStatusChange = (status: InvoiceStatusFilter) => {
        setPage(1);
        setStatusFilter(status);
    };

    return (
        <AdminLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Invoices
                </h2>
            }
        >
            <Head title="Admin invoices" />

            <div className="py-4">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                            <p className="text-muted-foreground text-sm">
                                All platform invoices
                            </p>
                            <TextInput
                                type="search"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search invoice, buyer, company, user…"
                                className="w-full sm:max-w-xs"
                            />
                        </div>

                        {!loading && summary.total > 0 ? (
                            <InvoiceStatusSummaryBar
                                summary={summary}
                                active={statusFilter}
                                onChange={handleStatusChange}
                            />
                        ) : null}

                        {loading ? (
                            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                                Loading…
                            </p>
                        ) : rows.length === 0 ? (
                            <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                                {summary.total === 0
                                    ? 'No invoices found.'
                                    : 'No invoices match this filter.'}
                            </p>
                        ) : (
                            <>
                                <AdminInvoicesTable rows={rows} />
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
                </div>
            </div>
        </AdminLayout>
    );
}
