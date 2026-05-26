import { invoiceStatusBadgeVariant } from '@/utils/invoiceStatusBadge';

type Props = {
    status: string;
    className?: string;
};

export default function InvoiceStatusBadge({ status, className = '' }: Props) {
    const { label, badge } = invoiceStatusBadgeVariant(status);

    return (
        <span className={`${badge}${className ? ` ${className}` : ''}`}>
            {label}
        </span>
    );
}
