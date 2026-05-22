import { useState, type ReactNode } from 'react';

type Props = {
    title: string;
    defaultOpen?: boolean;
    children: ReactNode;
};

export default function Accordion({
    title,
    defaultOpen = false,
    children,
}: Props) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-lg border border-border bg-card text-card-foreground">
            <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-foreground transition hover:bg-muted"
                onClick={() => setOpen((v) => !v)}
            >
                {title}
                <span className="text-sm text-muted-foreground">
                    {open ? '−' : '+'}
                </span>
            </button>
            {open ? (
                <div className="space-y-2 border-t border-border px-3 py-2.5">{children}</div>
            ) : null}
        </div>
    );
}
