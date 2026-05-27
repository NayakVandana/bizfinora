type Props = {
    name: string;
    layout: string;
    kind: 'general' | 'custom';
    isDefault?: boolean;
    selected?: boolean;
    onSelect: () => void;
};

function layoutLabel(layout: string): string {
    return layout === 'classic' ? 'Classic' : 'Modern';
}

function TemplateIcon({ layout, kind }: { layout: string; kind: 'general' | 'custom' }) {
    const classic = layout === 'classic';

    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                kind === 'custom'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : classic
                      ? 'border-border bg-muted text-muted-foreground'
                      : 'border-sidebar-primary/25 bg-sidebar-primary/10 text-sidebar-primary'
            }`}
        >
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
            </svg>
        </div>
    );
}

export default function TemplateLibraryCard({
    name,
    layout,
    kind,
    isDefault = false,
    selected = false,
    onSelect,
}: Props) {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary focus-visible:ring-offset-2 ${
                selected
                    ? 'bg-sidebar-primary/10 ring-1 ring-sidebar-primary/30'
                    : 'hover:bg-muted/80'
            }`}
        >
            <TemplateIcon layout={layout} kind={kind} />

            <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                    <p
                        className={`line-clamp-2 flex-1 text-sm font-medium leading-snug ${
                            selected ? 'text-sidebar-primary' : 'text-foreground'
                        }`}
                    >
                        {name}
                    </p>
                    {isDefault ? (
                        <span className="shrink-0 rounded-md bg-sidebar-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sidebar-primary-foreground">
                            Default
                        </span>
                    ) : null}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                    {kind === 'custom' ? 'Custom' : 'General'}
                    <span className="mx-1 opacity-40">·</span>
                    {layoutLabel(layout)}
                </p>
            </div>

            <svg
                className={`h-4 w-4 shrink-0 transition ${
                    selected
                        ? 'text-sidebar-primary opacity-100'
                        : 'text-muted-foreground opacity-0 group-hover:opacity-50'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </button>
    );
}
