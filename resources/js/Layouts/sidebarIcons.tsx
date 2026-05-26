import type { SVGProps } from 'react';

export type SidebarIconName =
    | 'dashboard'
    | 'buyers'
    | 'invoices'
    | 'library'
    | 'template'
    | 'preview'
    | 'tax'
    | 'payment'
    | 'terms'
    | 'signature'
    | 'user'
    | 'key'
    | 'palette'
    | 'building'
    | 'panelClose'
    | 'panelOpen';

const paths: Record<SidebarIconName, JSX.Element> = {
    dashboard: (
        <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </>
    ),
    buyers: (
        <>
            <path d="M16 19v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
            <circle cx="10" cy="8" r="3" />
            <path d="M22 19v-1a3 3 0 0 0-2.2-2.87" />
            <path d="M16 4.13a3 3 0 0 1 0 5.74" />
        </>
    ),
    invoices: (
        <>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </>
    ),
    library: (
        <>
            <path d="m4 19.5 16-7-16-7v14z" />
            <path d="M20 5.5v13" />
        </>
    ),
    template: (
        <>
            <path d="M12 3 4 7v10l8 4 8-4V7z" />
            <path d="m4 7 8 4 8-4M12 11v10" />
        </>
    ),
    preview: (
        <>
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    tax: (
        <>
            <path d="M9 7h6M9 11h6M9 15h4" />
            <rect x="4" y="3" width="16" height="18" rx="2" />
        </>
    ),
    payment: (
        <>
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M2 10h20" />
            <path d="M6 15h4" />
        </>
    ),
    terms: (
        <>
            <path d="M6 4h12v16H6z" />
            <path d="M9 8h6M9 12h6M9 16h4" />
        </>
    ),
    signature: (
        <>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </>
    ),
    user: (
        <>
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
        </>
    ),
    key: (
        <>
            <circle cx="8" cy="15" r="4" />
            <path d="m15 9 6-6M21 3l-3 3" />
        </>
    ),
    palette: (
        <>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
    ),
    building: (
        <>
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
            <path d="M6 12H4a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2h-2M10 6h4M10 10h4M10 14h4M10 18h4" />
        </>
    ),
    panelClose: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M14 9l-3 3 3 3" />
        </>
    ),
    panelOpen: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18M10 9l3 3-3 3" />
        </>
    ),
};

export function SidebarIcon({
    name,
    className = 'h-4 w-4',
    ...props
}: SVGProps<SVGSVGElement> & { name: SidebarIconName }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden
            {...props}
        >
            {paths[name]}
        </svg>
    );
}
