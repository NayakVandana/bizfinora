export const LISTING_PER_PAGE = 10;

/** 1-based row number for list/table index columns. */
export function listingIndex(arrayIndex: number, startAt = 1): number {
    return arrayIndex + startAt;
}

export const listingIndexThClass =
    'w-12 px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground';

export const listingIndexTdClass =
    'w-12 px-3 py-3 text-center text-sm tabular-nums text-muted-foreground';

export const listingIndexMobileClass =
    'text-xs font-medium tabular-nums text-muted-foreground';
