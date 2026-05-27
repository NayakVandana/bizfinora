import ListingIndex from '@/Components/ListingIndex';
import { formatDisplayDateTime } from '@/utils/formatDisplayDate';
import { listingIndexThClass } from '@/utils/listingIndex';
import type { AdminTemplateRow } from '@/types/admin';
import { Link } from '@inertiajs/react';

const th =
    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground';
const td = 'px-4 py-3 text-sm';

type Props = {
    rows: AdminTemplateRow[];
    showCompany?: boolean;
    onPreview?: (row: AdminTemplateRow) => void;
};

export default function AdminTemplatesTable({
    rows,
    showCompany = false,
    onPreview,
}: Props) {
    return (
        <>
            <ul className="divide-y divide-border md:hidden">
                {rows.map((row, index) => (
                    <li
                        key={`${row.company_id ?? 'x'}-${row.id}`}
                        className="px-4 py-3"
                    >
                        <ListingIndex index={index} variant="mobile" />
                        <p className="font-medium text-foreground">{row.name}</p>
                        {showCompany && row.company_id ? (
                            <p className="text-muted-foreground mt-0.5 text-xs">
                                <Link
                                    href={route(
                                        'admin.companies.show',
                                        row.company_id,
                                    )}
                                    className="text-sidebar-primary hover:opacity-80"
                                >
                                    {row.company_name}
                                </Link>
                            </p>
                        ) : null}
                        <p className="text-muted-foreground mt-1 text-xs">
                            {row.is_custom ? 'Custom' : 'General'}
                            {' · '}
                            {row.base_type_label ?? row.base_invoice_type}
                            {' · '}
                            {row.layout === 'classic' ? 'Classic' : 'Modern'}
                        </p>
                        {row.is_default ? (
                            <span className="mt-1 inline-flex rounded-full bg-sidebar-primary/15 px-2 py-0.5 text-[10px] font-semibold text-sidebar-primary">
                                Default
                            </span>
                        ) : null}
                        {onPreview && row.company_id ? (
                            <button
                                type="button"
                                onClick={() => onPreview(row)}
                                className="text-sidebar-primary mt-2 text-xs font-medium hover:opacity-80"
                            >
                                Preview
                            </button>
                        ) : null}
                    </li>
                ))}
            </ul>

            <table className="hidden w-full min-w-full divide-y divide-border text-sm md:table">
                <thead className="bg-muted">
                    <tr>
                        <th className={listingIndexThClass}>#</th>
                        {showCompany ? (
                            <th className={th}>Company</th>
                        ) : null}
                        <th className={th}>Name</th>
                        <th className={th}>Kind</th>
                        <th className={th}>Base type</th>
                        <th className={th}>Layout</th>
                        <th className={th}>Default</th>
                        <th className={th}>Created</th>
                        {onPreview ? <th className={th}>Actions</th> : null}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {rows.map((row, index) => (
                        <tr key={`${row.company_id ?? 'x'}-${row.id}`}>
                            <ListingIndex index={index} />
                            {showCompany ? (
                                <td className={`${td} text-muted-foreground`}>
                                    {row.company_id ? (
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
                            <td className={`${td} font-medium text-foreground`}>
                                {row.name}
                            </td>
                            <td className={`${td} text-muted-foreground`}>
                                {row.is_custom ? 'Custom' : 'General'}
                            </td>
                            <td className={`${td} text-muted-foreground`}>
                                {row.base_type_label ?? row.base_invoice_type}
                            </td>
                            <td
                                className={`${td} text-muted-foreground capitalize`}
                            >
                                {row.layout === 'classic' ? 'Classic' : 'Modern'}
                            </td>
                            <td className={td}>
                                {row.is_default ? (
                                    <span className="rounded-full bg-sidebar-primary/15 px-2 py-0.5 text-xs font-semibold text-sidebar-primary">
                                        Yes
                                    </span>
                                ) : (
                                    <span className="text-muted-foreground">
                                        —
                                    </span>
                                )}
                            </td>
                            <td className={`${td} text-muted-foreground`}>
                                {row.is_custom
                                    ? formatDisplayDateTime(row.created_at)
                                    : '—'}
                            </td>
                            {onPreview ? (
                                <td className={td}>
                                    {row.company_id ? (
                                        <button
                                            type="button"
                                            onClick={() => onPreview(row)}
                                            className="text-sidebar-primary text-xs font-medium hover:opacity-80"
                                        >
                                            Preview
                                        </button>
                                    ) : (
                                        <span className="text-muted-foreground">
                                            —
                                        </span>
                                    )}
                                </td>
                            ) : null}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
