import ListingIconAction from '@/Components/ListingIconAction';
import { useConfirm } from '@/contexts/ConfirmDialogContext';
import {
    invoiceCanReject,
    invoiceIsEditable,
} from '@/invoices/invoiceActions';

type InvoiceRowLike = {
    id: number;
    status: string;
    has_share_link?: boolean;
};

type Props = {
    row: InvoiceRowLike;
    variant: 'app' | 'admin';
    downloadingId?: number | null;
    sharingId?: number | null;
    rejectingId?: number | null;
    onDownload: (id: number) => void;
    onShare: (id: number) => void;
    onReject?: (id: number) => void;
    hasShareLink?: (row: InvoiceRowLike) => boolean;
};

export default function InvoiceListingActions({
    row,
    variant,
    downloadingId = null,
    sharingId = null,
    rejectingId = null,
    onDownload,
    onShare,
    onReject,
    hasShareLink = (r) => Boolean(r.has_share_link),
}: Props) {
    const { confirm } = useConfirm();

    const handleReject = async () => {
        if (!onReject) {
            return;
        }

        const ok = await confirm({
            title: 'Reject invoice?',
            message:
                'This invoice will be moved to rejected and cannot be edited.',
            confirmLabel: 'Reject',
            variant: 'danger',
        });

        if (ok) {
            onReject(row.id);
        }
    };

    const viewHref =
        variant === 'admin'
            ? route('admin.invoices.show', row.id)
            : route('invoices.show', row.id);

    const editHref =
        variant === 'app' && invoiceIsEditable(row.status)
            ? route('invoices.edit', row.id)
            : undefined;

    const shareLabel = hasShareLink(row)
        ? 'Copy share link'
        : 'Create share link';

    return (
        <div className="inline-flex flex-wrap items-center justify-end gap-0.5">
            <ListingIconAction
                label="View"
                icon="view"
                href={viewHref}
            />
            {editHref ? (
                <ListingIconAction label="Edit" icon="edit" href={editHref} />
            ) : null}
            <ListingIconAction
                label="Download PDF"
                icon="download"
                busy={downloadingId === row.id}
                disabled={downloadingId === row.id}
                onClick={() => onDownload(row.id)}
            />
            <ListingIconAction
                label={shareLabel}
                icon="share"
                busy={sharingId === row.id}
                disabled={sharingId === row.id}
                onClick={() => onShare(row.id)}
            />
            {variant === 'app' && invoiceCanReject(row.status) && onReject ? (
                <ListingIconAction
                    label="Bin / Reject"
                    icon="reject"
                    variant="danger"
                    busy={rejectingId === row.id}
                    disabled={rejectingId === row.id}
                    onClick={() => void handleReject()}
                />
            ) : null}
        </div>
    );
}
