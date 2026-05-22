import ListingIndex from '@/Components/ListingIndex';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { listingIndexThClass } from '@/utils/listingIndex';
import { invoicePayloadToDraft } from '@/invoices/defaultDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import { formatMoney } from '@/invoices/formatMoney';
import { statusBadgeClass } from '@/utils/statusBadgeClass';
import type { InvoiceDraft } from '@/invoices/types';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

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
};

type Paginated = {
    data: InvoiceRow[];
};

export default function InvoicesIndex() {
    const [rows, setRows] = useState<InvoiceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const downloadInvoice = async (id: number) => {
        setDownloadingId(id);
        try {
            const res = await companyApiPost<
                ApiEnvelope<InvoiceDraft & { id: number }>
            >('/invoices/invoice-show', { id });
            if (res.success && res.data) {
                const draft = invoicePayloadToDraft(
                    res.data as unknown as Record<string, unknown>,
                );
                await downloadInvoicePdf(draft);
            }
        } finally {
            setDownloadingId(null);
        }
    };

    useEffect(() => {
        companyApiPost<ApiEnvelope<Paginated>>('/invoices/invoices-list', {})
            .then((res) => {
                if (res.success && res.data?.data) {
                    setRows(res.data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold leading-tight">
                    Invoices
                </h2>
            }
        >
            <Head title="Invoices" />

            <div className="py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                        <div className="flex flex-col gap-2 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <p className="text-muted-foreground text-sm">
                                Create, edit, and download invoices (INR)
                            </p>
                            <Link href={route('invoices.create')}>
                                <PrimaryButton>New invoice</PrimaryButton>
                            </Link>
                        </div>
                        {loading ? (
                            <p className="text-muted-foreground p-6">Loading…</p>
                        ) : rows.length === 0 ? (
                            <p className="text-muted-foreground p-6">
                                No invoices yet.{' '}
                                <Link
                                    href={route('invoices.create')}
                                    className="font-medium text-sidebar-primary hover:opacity-80 underline"
                                >
                                    Create your first invoice
                                </Link>
                                .
                            </p>
                        ) : (
                            <>
                                <ul className="divide-y divide-border md:hidden">
                                    {rows.map((row, index) => (
                                        <li
                                            key={row.id}
                                            className="px-4 py-3"
                                        >
                                            <div className="mb-1">
                                                <ListingIndex
                                                    index={index}
                                                    variant="mobile"
                                                />
                                            </div>
                                            <Link
                                                href={route(
                                                    'invoices.edit',
                                                    row.id,
                                                )}
                                                className="font-medium text-sidebar-primary hover:opacity-80 font-medium"
                                            >
                                                {row.invoice_number}
                                            </Link>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {row.buyer_name ?? '—'} ·{' '}
                                                {row.invoice_date}
                                            </p>
                                            <div className="mt-2 flex items-center justify-between">
                                                <span
                                                    className={statusBadgeClass(
                                                        row.status,
                                                    )}
                                                >
                                                    {row.status}
                                                </span>
                                                <span className="text-foreground text-sm font-medium">
                                                    {formatMoney(row.total)}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex gap-3 text-sm">
                                                <Link
                                                    href={route(
                                                        'invoices.edit',
                                                        row.id,
                                                    )}
                                                    className="font-medium text-sidebar-primary hover:opacity-80"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        downloadingId ===
                                                        row.id
                                                    }
                                                    onClick={() =>
                                                        void downloadInvoice(
                                                            row.id,
                                                        )
                                                    }
                                                    className="font-medium text-sidebar-primary hover:opacity-80 disabled:opacity-50"
                                                >
                                                    {downloadingId === row.id
                                                        ? 'PDF…'
                                                        : 'Download'}
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <table className="w-full min-w-full divide-y divide-border text-sm hidden md:table">
                                <thead className="bg-muted">
                                    <tr>
                                        <th
                                            className={listingIndexThClass}
                                        >
                                            #
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-xs uppercase">
                                            Number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-xs uppercase">
                                            Buyer
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-xs uppercase">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-xs uppercase">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-right text-xs uppercase">
                                            Total
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground text-right text-xs uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {rows.map((row, index) => (
                                        <tr key={row.id}>
                                            <ListingIndex index={index} />
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {row.invoice_number}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">
                                                {row.buyer_name ?? '—'}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">
                                                {row.invoice_date}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                <span
                                                    className={statusBadgeClass(
                                                        row.status,
                                                    )}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-right text-sm">
                                                {formatMoney(row.total)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-right text-sm">
                                                <Link
                                                    href={route(
                                                        'invoices.edit',
                                                        row.id,
                                                    )}
                                                    className="font-medium text-sidebar-primary hover:opacity-80"
                                                >
                                                    Edit
                                                </Link>
                                                <span className="mx-2 text-border">
                                                    |
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={
                                                        downloadingId ===
                                                        row.id
                                                    }
                                                    onClick={() =>
                                                        void downloadInvoice(
                                                            row.id,
                                                        )
                                                    }
                                                    className="font-medium text-sidebar-primary hover:opacity-80 disabled:opacity-50"
                                                >
                                                    {downloadingId === row.id
                                                        ? 'PDF…'
                                                        : 'Download'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
