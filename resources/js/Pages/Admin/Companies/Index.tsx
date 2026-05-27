import ListingIndex from '@/Components/ListingIndex';
import ListingPagination from '@/Components/ListingPagination';
import { LISTING_PER_PAGE } from '@/utils/listingIndex';
import TextInput from '@/Components/TextInput';
import { formatDisplayDateTime } from '@/utils/formatDisplayDate';
import AdminLayout from '@/Layouts/AdminLayout';
import { listingIndexThClass } from '@/utils/listingIndex';
import {
    adminApiPost,
    type ApiEnvelope,
    type Paginated,
} from '@/api/adminClient';
import type { AdminCompanyRow } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function AdminCompaniesIndex() {
    const [rows, setRows] = useState<AdminCompanyRow[]>([]);
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

        const res = await adminApiPost<ApiEnvelope<Paginated<AdminCompanyRow>>>(
            '/companies/companies-list',
            {
                per_page: LISTING_PER_PAGE,
                current_page: page,
                keyword: search || undefined,
            },
        );

        if (res.success && res.data) {
            setRows(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                from: res.data.from,
                to: res.data.to,
            });
        }

        setLoading(false);
    }, [page, search]);

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

    return (
        <AdminLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Companies
                </h2>
            }
        >
            <Head title="Admin companies" />

            <div className="py-6">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-muted-foreground text-sm">
                                All companies on the platform
                            </p>
                            <TextInput
                                type="search"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search name or slug…"
                                className="w-full sm:max-w-xs"
                            />
                        </div>

                        {loading ? (
                            <p className="text-muted-foreground p-6 text-center">
                                Loading…
                            </p>
                        ) : rows.length === 0 ? (
                            <p className="text-muted-foreground p-6 text-center">
                                No companies found.
                            </p>
                        ) : (
                            <>
                                <ul className="divide-y divide-border md:hidden">
                                    {rows.map((row, index) => (
                                        <li key={row.id} className="px-4 py-4">
                                            <ListingIndex
                                                index={index}
                                                variant="mobile"
                                            />
                                            <Link
                                                href={route(
                                                    'admin.companies.show',
                                                    row.id,
                                                )}
                                                className="font-medium text-sidebar-primary hover:opacity-80"
                                            >
                                                {row.name}
                                            </Link>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {row.slug} ·{' '}
                                                {row.users_count ?? 0} member
                                                {(row.users_count ?? 0) === 1
                                                    ? ''
                                                    : 's'}{' '}
                                                · {row.buyers_count ?? 0} buyer
                                                {(row.buyers_count ?? 0) === 1
                                                    ? ''
                                                    : 's'}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                <table className="hidden w-full min-w-full divide-y divide-border text-sm md:table">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className={listingIndexThClass}>
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Slug
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Members
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Buyers
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Created
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, index) => (
                                            <tr key={row.id}>
                                                <ListingIndex index={index} />
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    {row.name}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.slug}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.users_count ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.buyers_count ?? 0}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDisplayDateTime(row.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={route(
                                                            'admin.companies.show',
                                                            row.id,
                                                        )}
                                                        className="font-medium text-sidebar-primary hover:opacity-80"
                                                    >
                                                        View
                                                    </Link>
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
                </div>
            </div>
        </AdminLayout>
    );
}
