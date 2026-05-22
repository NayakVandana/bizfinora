import {
    listingIndex,
    listingIndexMobileClass,
    listingIndexTdClass,
} from '@/utils/listingIndex';

type Props = {
    index: number;
    variant?: 'table' | 'mobile' | 'inline';
};

export default function ListingIndex({
    index,
    variant = 'table',
}: Props) {
    const n = listingIndex(index);

    if (variant === 'mobile') {
        return (
            <span className={listingIndexMobileClass}>#{n}</span>
        );
    }

    if (variant === 'inline') {
        return (
            <span className="tabular-nums text-muted-foreground">{n}.</span>
        );
    }

    return <td className={listingIndexTdClass}>{n}</td>;
}
