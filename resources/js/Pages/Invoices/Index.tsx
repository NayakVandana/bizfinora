import ListingIndex from '@/Components/ListingIndex';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { listingIndexThClass } from '@/utils/listingIndex';
import {
    companyContextFromMeta,
    mergeCompanyContextIntoDraft,
} from '@/invoices/companyContext';
import { invoicePayloadToDraft } from '@/invoices/defaultDraft';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import { formatMoney } from '@/invoices/formatMoney';
import InvoiceStatusBadge from '@/Components/InvoiceStatusBadge';
import type { InvoiceDraft } from '@/invoices/types';
import { LISTING_PER_PAGE } from '@/utils/listingIndex';
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

function rowActionsClass(disabled: boolean) {
    return `font-medium text-sidebar-primary hover:opacity-80${disabled ? ' opacity-50 pointer-events-none' : ''}`;
}

export default function InvoicesIndex() {
    const [rows, setRows] = useState<InvoiceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [sharingId, setSharingId] = useState<number | null>(null);
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

    useEffect(() => {
        companyApiPost<ApiEnvelope<Paginated>>('/invoices/invoices-list', {
            per_page: LISTING_PER_PAGE,
            current_page: 1,
        })
            .then((res) => {
                if (res.success && res.data?.data) {
                    setRows(res.data.data);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const renderRowActions = (row: InvoiceRow) => (
        <>
            <Link
                href={route('invoices.edit', row.id)}
                className={rowActionsClass(false)}
            >
                Edit
            </Link>
            <span className="mx-2 text-border">|</span>
            <button
                type="button"
                disabled={downloadingId === row.id}
                onClick={() => void downloadInvoice(row.id)}
                className={rowActionsClass(downloadingId === row.id)}
            >
                {downloadingId === row.id ? 'PDF…' : 'Download PDF'}
            </button>
            <span className="mx-2 text-border">|</span>
            <button
                type="button"
                disabled={sharingId === row.id}
                onClick={() => void createShareLink(row.id)}
                className={rowActionsClass(sharingId === row.id)}
            >
                {sharingId === row.id
                    ? 'Link…'
                    : row.has_share_link
                      ? 'Copy share link'
                      : 'Create share link'}
            </button>
        </>
    );

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

                        {shareMessage ? (
                            <div className="border-b border-border bg-muted/40 px-4 py-2 text-sm text-foreground sm:px-6">
                                {shareMessage}
                            </div>
                        ) : null}

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
                                                <InvoiceStatusBadge
                                                    status={row.status}
                                                />
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
