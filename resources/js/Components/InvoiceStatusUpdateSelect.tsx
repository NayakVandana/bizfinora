import { useEffect, useState } from 'react';
import type { InvoiceStatus } from '@/invoices/types';
import {
    invoiceCanUpdateStatus,
    LISTING_STATUS_VALUES,
    listingStatusLabel,
} from '@/invoices/invoiceStatusOptions';

type Props = {
    status: string;
    updating?: boolean;
    onChange: (status: InvoiceStatus) => boolean | Promise<boolean>;
};

export default function InvoiceStatusUpdateSelect({
    status,
    updating = false,
    onChange,
}: Props) {
    const [selected, setSelected] = useState(status);

    useEffect(() => {
        setSelected(status);
    }, [status]);

    if (!invoiceCanUpdateStatus(status)) {
        return null;
    }

    return (
        <select
            className="h-8 max-w-[6.5rem] rounded-md border border-border bg-card px-1.5 text-xs text-foreground disabled:opacity-50"
            value={selected}
            disabled={updating}
            title="Update status"
            aria-label="Update invoice status"
            onChange={async (e) => {
                const nextStatus = e.target.value as InvoiceStatus;

                if (nextStatus === status) {
                    return;
                }

                setSelected(nextStatus);

                const accepted = await onChange(nextStatus);

                if (!accepted) {
                    setSelected(status);
                }
            }}
        >
            {LISTING_STATUS_VALUES.map((value) => (
                <option key={value} value={value}>
                    {listingStatusLabel(value)}
                </option>
            ))}
        </select>
    );
}
