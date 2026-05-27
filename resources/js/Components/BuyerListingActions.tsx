import ListingIconAction from '@/Components/ListingIconAction';

type Props = {
    buyerId: number;
    onDelete: () => void;
};

export default function BuyerListingActions({ buyerId, onDelete }: Props) {
    return (
        <div className="inline-flex flex-wrap items-center gap-0.5">
            <ListingIconAction
                label="View"
                icon="view"
                href={route('buyers.show', buyerId)}
            />
            <ListingIconAction
                label="Edit"
                icon="edit"
                href={route('buyers.edit', buyerId)}
            />
            <ListingIconAction
                label="Delete"
                icon="reject"
                variant="danger"
                onClick={onDelete}
            />
        </div>
    );
}
