import ListingIconAction from '@/Components/ListingIconAction';
import InvoiceStatusUpdateSelect from '@/Components/InvoiceStatusUpdateSelect';
import { useConfirm } from '@/contexts/ConfirmDialogContext';
import type { InvoiceStatus } from '@/invoices/types';
import {
    invoiceCanReject,
    invoiceIsEditable,
    INVOICE_STATUS_LABELS,
} from '@/invoices/invoiceActions';
import { invoiceCanUpdateStatus } from '@/invoices/invoiceStatusOptions';

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
    updatingStatusId?: number | null;
    onDownload: (id: number) => void;
    onShare: (id: number) => void;
    onReject?: (id: number) => void;
    onStatusChange?: (id: number, status: InvoiceStatus) => void;
    hasShareLink?: (row: InvoiceRowLike) => boolean;
};

export default function InvoiceListingActions({
    row,
    variant,
    downloadingId = null,
    sharingId = null,
    rejectingId = null,
    updatingStatusId = null,
    onDownload,
    onShare,
    onReject,
    onStatusChange,
    hasShareLink = (r) => Boolean(r.has_share_link),
}: Props) {
    const { confirm } = useConfirm();

    const handleStatusChange = async (nextStatus: InvoiceStatus) => {
        if (!onStatusChange || nextStatus === row.status) {
            return false;
        }

        const ok = await confirm({
            title: 'Update invoice status?',
            message: `Change status to ${INVOICE_STATUS_LABELS[nextStatus]}?`,
            confirmLabel: 'Update',
        });

        if (ok) {
            onStatusChange(row.id, nextStatus);
        }

        return ok;
    };

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
            {variant === 'app' && invoiceCanUpdateStatus(row.status) && onStatusChange ? (
                <InvoiceStatusUpdateSelect
                    status={row.status}
                    updating={updatingStatusId === row.id}
                    onChange={(status) => handleStatusChange(status)}
                />
            ) : null}
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
