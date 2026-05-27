type Props = {
    layout: string;
    name: string;
    isDefault?: boolean;
    kind?: 'general' | 'custom';
};

function isClassicLayout(layout: string): boolean {
    return layout === 'classic';
}

function ModernMiniPreview() {
    return (
        <div className="flex h-full flex-col bg-white p-2.5 pb-8 text-[#1a1a2e]">
            <div className="flex items-start justify-between gap-1">
                <div>
                    <p className="text-[8px] font-bold tracking-wide">INVOICE</p>
                    <p className="mt-px text-[5px] text-neutral-400">#001</p>
                </div>
                <div className="h-3.5 w-3.5 rounded bg-neutral-100" />
            </div>

            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                <div className="space-y-px">
                    <p className="text-[4px] font-semibold uppercase text-neutral-400">
                        From
                    </p>
                    <div className="h-0.5 w-full rounded-sm bg-neutral-200" />
                </div>
                <div className="space-y-px">
                    <p className="text-[4px] font-semibold uppercase text-neutral-400">
                        Bill to
                    </p>
                    <div className="h-0.5 w-full rounded-sm bg-neutral-200" />
                </div>
            </div>

            <div className="mt-1.5 min-h-0 flex-1 overflow-hidden rounded border border-neutral-200">
                <div className="grid grid-cols-4 bg-neutral-50">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="border-b border-r border-neutral-200 px-0.5 py-0.5 last:border-r-0"
                        >
                            <div className="h-0.5 rounded-sm bg-neutral-300" />
                        </div>
                    ))}
                </div>
                {[...Array(3)].map((_, row) => (
                    <div key={row} className="grid grid-cols-4">
                        {[...Array(4)].map((_, col) => (
                            <div
                                key={col}
                                className="border-b border-r border-neutral-100 px-0.5 py-0.5 last:border-r-0"
                            >
                                <div className="h-0.5 rounded-sm bg-neutral-100" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

function ClassicMiniPreview() {
    return (
        <div className="flex h-full flex-col bg-white p-2 pb-8 text-neutral-900">
            <p className="text-center text-[7px] font-bold uppercase tracking-widest">
                Invoice
            </p>
            <div className="my-1 border-t-2 border-neutral-800" />

            <div className="grid grid-cols-2 gap-1.5">
                <div className="h-0.5 w-full bg-neutral-400" />
                <div className="h-0.5 w-full bg-neutral-400" />
            </div>

            <div className="mt-1.5 min-h-0 flex-1 border-2 border-neutral-800">
                <div className="grid grid-cols-3 border-b-2 border-neutral-800 bg-neutral-100">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="border-r border-neutral-800 px-0.5 py-px last:border-r-0"
                        >
                            <div className="h-0.5 bg-neutral-500" />
                        </div>
                    ))}
                </div>
                {[...Array(4)].map((_, row) => (
                    <div key={row} className="grid grid-cols-3">
                        {[...Array(3)].map((_, col) => (
                            <div
                                key={col}
                                className="border-b border-r border-neutral-300 px-0.5 py-0.5 last:border-r-0"
                            >
                                <div className="h-0.5 bg-neutral-200" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function TemplateCardThumbnail({
    layout,
    name,
    isDefault = false,
    kind = 'general',
}: Props) {
    const classic = isClassicLayout(layout);

    return (
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
            {classic ? <ClassicMiniPreview /> : <ModernMiniPreview />}

            {kind === 'custom' ? (
                <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1 py-px text-[7px] font-bold uppercase tracking-wide text-white shadow-sm">
                    Custom
                </span>
            ) : null}

            {isDefault ? (
                <span className="absolute right-1.5 top-1.5 rounded bg-sidebar-primary px-1 py-px text-[7px] font-bold uppercase tracking-wide text-sidebar-primary-foreground shadow-sm">
                    Default
                </span>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral-900/85 via-neutral-900/50 to-transparent px-2 pb-2 pt-8">
                <p className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-white">
                    {name}
                </p>
            </div>
        </div>
    );
}
