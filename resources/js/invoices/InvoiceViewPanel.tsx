import InvoicePreview from '@/invoices/InvoicePreview';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import type { InvoiceDraft } from '@/invoices/types';
import SecondaryButton from '@/Components/SecondaryButton';
import { Link } from '@inertiajs/react';

type Props = {
    draft: InvoiceDraft | null;
    loading: boolean;
    error?: string | null;
    hasShareLink?: boolean;
    downloading?: boolean;
    sharing?: boolean;
    shareMessage?: string | null;
    onDownload: () => void;
    onShare: () => void;
    editHref?: string;
};

export default function InvoiceViewPanel({
    draft,
    loading,
    error,
    hasShareLink = false,
    downloading = false,
    sharing = false,
    shareMessage,
    onDownload,
    onShare,
    editHref,
}: Props) {
    if (loading) {
        return (
            <p className="text-muted-foreground text-sm">Loading invoice…</p>
        );
    }

    if (error) {
        return <p className="text-red-600 text-sm">{error}</p>;
    }

    if (!draft) {
        return (
            <p className="text-muted-foreground text-sm">Invoice not found.</p>
        );
    }

    return (
        <div className="space-y-4">
            {shareMessage ? (
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm text-foreground">
                    {shareMessage}
                </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
                {editHref ? (
                    <Link href={editHref}>
                        <SecondaryButton type="button">Edit</SecondaryButton>
                    </Link>
                ) : null}
                <SecondaryButton
                    type="button"
                    disabled={downloading}
                    onClick={onDownload}
                >
                    {downloading ? 'PDF…' : 'Download PDF'}
                </SecondaryButton>
                <SecondaryButton
                    type="button"
                    disabled={sharing}
                    onClick={onShare}
                >
                    {sharing
                        ? 'Link…'
                        : hasShareLink
                          ? 'Copy share link'
                          : 'Create share link'}
                </SecondaryButton>
            </div>

            <InvoicePreview draft={draft} />
        </div>
    );
}
