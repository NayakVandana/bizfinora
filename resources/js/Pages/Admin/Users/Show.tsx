import ListingIndex from '@/Components/ListingIndex';
import AdminDetailPanel from '@/Components/admin/AdminDetailPanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { listingIndexThClass } from '@/utils/listingIndex';
import { formatDisplayDateTime } from '@/utils/formatDisplayDate';
import { userAccountFields, userAddressFields } from '@/utils/adminEntityFields';
import { adminApiPost, type ApiEnvelope } from '@/api/adminClient';
import type { AdminUserDetail } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const compactTh =
    'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground';
const compactTd = 'px-3 py-2 text-sm';

export default function AdminUserShow({ userId }: { userId: number }) {
    const [user, setUser] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            const res = await adminApiPost<ApiEnvelope<AdminUserDetail>>(
                '/users/user-show',
                { id: userId },
            );

            if (res.success && res.data) {
                setUser(res.data);
            } else {
                setError(res.message || 'User not found.');
            }

            setLoading(false);
        };

        void load();
    }, [userId]);

    return (
        <AdminLayout
            header={
                <div>
                    <Link
                        href={route('admin.users.index')}
                        className="text-muted-foreground mb-0.5 inline-block text-sm hover:text-foreground"
                    >
                        ← Users
                    </Link>
                    <h2 className="text-foreground text-lg font-semibold">
                        {user?.name ?? 'User'}
                    </h2>
                </div>
            }
        >
            <Head title={user?.name ?? 'User'} />

            <div className="py-4">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-muted-foreground text-center text-sm">
                            Loading…
                        </p>
                    ) : error || !user ? (
                        <div className="overflow-hidden rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                            <p className="text-muted-foreground text-sm">
                                {error}
                            </p>
                            <Link
                                href={route('admin.users.index')}
                                className="font-medium text-sidebar-primary hover:opacity-80 mt-2 inline-block text-sm"
                            >
                                Back to users
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AdminDetailPanel
                                title="User details"
                                groups={[
                                    {
                                        title: 'Account',
                                        fields: userAccountFields(user),
                                    },
                                    {
                                        title: 'Address',
                                        fields: userAddressFields(user),
                                    },
                                ]}
                            />

                            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                                <div className="border-b border-border px-4 py-2.5">
                                    <p className="text-foreground text-sm font-medium">
                                        Companies (
                                        {user.companies_count ??
                                            user.companies.length}
                                        )
                                    </p>
                                </div>

                                {user.companies.length === 0 ? (
                                    <p className="text-muted-foreground px-4 py-3 text-center text-sm">
                                        No companies linked to this user.
                                    </p>
                                ) : (
                                    <>
                                        <ul className="divide-y divide-border md:hidden">
                                            {user.companies.map(
                                                (company, index) => (
                                                    <li
                                                        key={company.id}
                                                        className="px-4 py-2.5"
                                                    >
                                                        <ListingIndex
                                                            index={index}
                                                            variant="mobile"
                                                        />
                                                        <Link
                                                            href={route(
                                                                'admin.companies.show',
                                                                company.id,
                                                            )}
                                                            className="font-medium text-sidebar-primary hover:opacity-80 text-sm"
                                                        >
                                                            {company.name}
                                                        </Link>
                                                        <p className="text-muted-foreground text-xs">
                                                            {company.slug} ·{' '}
                                                            <span className="capitalize">
                                                                {company.role}
                                                            </span>
                                                            {company.is_current
                                                                ? ' · Current'
                                                                : ''}
                                                        </p>
                                                    </li>
                                                ),
                                            )}
                                        </ul>

                                        <table className="hidden w-full divide-y divide-border text-sm md:table">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th
                                                        className={
                                                            listingIndexThClass
                                                        }
                                                    >
                                                        #
                                                    </th>
                                                    <th className={compactTh}>
                                                        Name
                                                    </th>
                                                    <th className={compactTh}>
                                                        Slug
                                                    </th>
                                                    <th className={compactTh}>
                                                        Role
                                                    </th>
                                                    <th className={compactTh}>
                                                        Joined
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {user.companies.map(
                                                    (company, index) => (
                                                        <tr key={company.id}>
                                                            <ListingIndex
                                                                index={index}
                                                            />
                                                            <td
                                                                className={`${compactTd} font-medium text-foreground`}
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'admin.companies.show',
                                                                        company.id,
                                                                    )}
                                                                    className="text-sidebar-primary hover:opacity-80"
                                                                >
                                                                    {
                                                                        company.name
                                                                    }
                                                                </Link>
                                                                {company.is_current ? (
                                                                    <span className="text-muted-foreground ml-1 text-xs">
                                                                        (current)
                                                                    </span>
                                                                ) : null}
                                                            </td>
                                                            <td
                                                                className={`${compactTd} text-muted-foreground`}
                                                            >
                                                                {company.slug}
                                                            </td>
                                                            <td
                                                                className={`${compactTd} text-muted-foreground capitalize`}
                                                            >
                                                                {company.role}
                                                            </td>
                                                            <td
                                                                className={`${compactTd} text-muted-foreground`}
                                                            >
                                                                {formatDisplayDateTime(
                                                                    company.created_at,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
