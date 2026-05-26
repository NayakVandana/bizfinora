import SecondaryButton from '@/Components/SecondaryButton';

type Props = {
    currentPage: number;
    lastPage: number;
    total: number;
    from: number | null;
    to: number | null;
    onPageChange: (page: number) => void;
};

export default function ListingPagination({
    currentPage,
    lastPage,
    total,
    from,
    to,
    onPageChange,
}: Props) {
    if (lastPage <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-muted-foreground text-sm">
                {from !== null && to !== null
                    ? `Showing ${from}–${to} of ${total}`
                    : `${total} total`}
            </p>
            <div className="flex items-center gap-2">
                <SecondaryButton
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    Previous
                </SecondaryButton>
                <span className="text-muted-foreground px-2 text-sm">
                    Page {currentPage} of {lastPage}
                </span>
                <SecondaryButton
                    type="button"
                    disabled={currentPage >= lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Next
                </SecondaryButton>
            </div>
        </div>
    );
}
