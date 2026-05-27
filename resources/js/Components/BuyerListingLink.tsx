import { Link } from '@inertiajs/react';

type Props = {
    buyerId?: number | null;
    buyerName?: string | null;
    className?: string;
};

export default function BuyerListingLink({
    buyerId,
    buyerName,
    className = 'text-sidebar-primary hover:opacity-80',
}: Props) {
    const label = buyerName?.trim() || '—';

    if (!buyerId || label === '—') {
        return <>{label}</>;
    }

    return (
        <Link href={route('buyers.show', buyerId)} className={className}>
            {label}
        </Link>
    );
}
