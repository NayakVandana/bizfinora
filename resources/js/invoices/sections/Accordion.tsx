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
        <div className="rounded-lg border border-gray-200">
            <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-gray-900 hover:bg-gray-50"
                onClick={() => setOpen((v) => !v)}
            >
                {title}
                <span className="text-sm text-gray-500">{open ? '−' : '+'}</span>
            </button>
            {open ? <div className="space-y-3 border-t border-gray-100 px-4 py-3">{children}</div> : null}
        </div>
    );
}
