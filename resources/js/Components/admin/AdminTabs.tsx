import type { ReactNode } from 'react';

export type AdminTabItem<T extends string> = {
    id: T;
    label: string;
    count?: number;
};

type Props<T extends string> = {
    tabs: AdminTabItem<T>[];
    active: T;
    onChange: (id: T) => void;
    ariaLabel?: string;
};

export default function AdminTabs<T extends string>({
    tabs,
    active,
    onChange,
    ariaLabel = 'Detail tabs',
}: Props<T>) {
    return (
        <div className="border-b border-border">
            <nav
                className="-mb-px flex gap-4 overflow-x-auto sm:gap-6"
                aria-label={ariaLabel}
            >
                {tabs.map((tab) => {
                    const selected = active === tab.id;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onChange(tab.id)}
                            className={
                                selected
                                    ? 'shrink-0 border-b-2 border-sidebar-primary px-1 pb-2.5 text-sm font-medium text-sidebar-primary'
                                    : 'shrink-0 border-b-2 border-transparent px-1 pb-2.5 text-sm font-medium text-muted-foreground transition hover:border-border hover:text-foreground'
                            }
                        >
                            {tab.label}
                            {tab.count !== undefined ? (
                                <span
                                    className={
                                        selected
                                            ? 'ml-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground'
                                            : 'ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground'
                                    }
                                >
                                    {tab.count}
                                </span>
                            ) : null}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}

export function AdminTabPanel({
    active,
    id,
    children,
}: {
    active: string;
    id: string;
    children: ReactNode;
}) {
    if (active !== id) {
        return null;
    }

    return <div className="pt-4">{children}</div>;
}
