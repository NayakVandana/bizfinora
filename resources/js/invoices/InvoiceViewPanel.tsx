import ListingIconAction from '@/Components/ListingIconAction';
import InvoicePreview from '@/invoices/InvoicePreview';
import type { InvoiceDraft } from '@/invoices/types';
import { formatDisplayDateTime } from '@/utils/formatDisplayDate';

type Props = {
    draft: InvoiceDraft | null;
    loading: boolean;
    error?: string | null;
    hasShareLink?: boolean;
    downloading?: boolean;
    sharing?: boolean;
    shareMessage?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
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
    createdAt,
    updatedAt,
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

    const shareLabel = hasShareLink ? 'Copy share link' : 'Create share link';

    return (
        <div className="space-y-4">
            {shareMessage ? (
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-2 text-sm text-foreground">
                    {shareMessage}
                </div>
            ) : null}

            {createdAt || updatedAt ? (
                <dl className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {createdAt ? (
                        <div>
                            <dt className="inline font-medium">Created: </dt>
                            <dd className="inline">
                                {formatDisplayDateTime(createdAt)}
                            </dd>
                        </div>
                    ) : null}
                    {updatedAt && updatedAt !== createdAt ? (
                        <div>
                            <dt className="inline font-medium">Updated: </dt>
                            <dd className="inline">
                                {formatDisplayDateTime(updatedAt)}
                            </dd>
                        </div>
                    ) : null}
                </dl>
            ) : null}

            <div className="flex flex-wrap items-center gap-1">
                {editHref ? (
                    <ListingIconAction
                        label="Edit"
                        icon="edit"
                        href={editHref}
                    />
                ) : null}
                <ListingIconAction
                    label="Download PDF"
                    icon="download"
                    busy={downloading}
                    disabled={downloading}
                    onClick={onDownload}
                />
                <ListingIconAction
                    label={shareLabel}
                    icon="share"
                    busy={sharing}
                    disabled={sharing}
                    onClick={onShare}
                />
            </div>

            <InvoicePreview draft={draft} />
        </div>
    );
}
