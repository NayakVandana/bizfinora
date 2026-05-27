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
import type { AdminUserRow } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

export default function AdminUsersIndex() {
    const [rows, setRows] = useState<AdminUserRow[]>([]);
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

        const res = await adminApiPost<ApiEnvelope<Paginated<AdminUserRow>>>(
            '/users/users-list',
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
                <h2 className="text-foreground text-xl font-semibold">Users</h2>
            }
        >
            <Head title="Admin users" />

            <div className="py-6">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-muted-foreground text-sm">
                                All registered users
                            </p>
                            <TextInput
                                type="search"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search name or email…"
                                className="w-full sm:max-w-xs"
                            />
                        </div>

                        {loading ? (
                            <p className="text-muted-foreground p-6 text-center">
                                Loading…
                            </p>
                        ) : rows.length === 0 ? (
                            <p className="text-muted-foreground p-6 text-center">
                                No users found.
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
                                                    'admin.users.show',
                                                    row.id,
                                                )}
                                                className="font-medium text-sidebar-primary hover:opacity-80"
                                            >
                                                {row.name}
                                            </Link>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {row.email}
                                            </p>
                                            <div className="text-muted-foreground mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                                                <span>
                                                    Joined{' '}
                                                    {formatDisplayDateTime(row.created_at)}
                                                </span>
                                                {row.is_admin ? (
                                                    <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                                                        Admin
                                                    </span>
                                                ) : null}
                                            </div>
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
                                                Email
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Joined
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Role
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
                                                    {row.email}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {formatDisplayDateTime(row.created_at)}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {row.is_admin ? (
                                                        <span className="rounded bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                                                            Admin
                                                        </span>
                                                    ) : (
                                                        'User'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={route(
                                                            'admin.users.show',
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
