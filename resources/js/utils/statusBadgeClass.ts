export function statusBadgeClass(status: string): string {
    switch (status) {
        case 'paid':
            return 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs capitalize text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300';
        case 'sent':
            return 'rounded-full bg-accent px-2 py-0.5 text-xs capitalize text-accent-foreground';
        default:
            return 'rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground';
    }
}
