import { ActionIcon, type ActionIconName } from '@/Components/icons/ActionIcon';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

const baseClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-md text-sidebar-primary transition hover:bg-muted hover:opacity-100';

const dangerClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50 hover:opacity-100 dark:text-red-400 dark:hover:bg-red-950/40';

type Props = {
    label: string;
    icon: ActionIconName;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    busy?: boolean;
    variant?: 'default' | 'danger';
};

export default function ListingIconAction({
    label,
    icon,
    href,
    onClick,
    disabled = false,
    busy = false,
    variant = 'default',
}: Props) {
    const className = `${variant === 'danger' ? dangerClass : baseClass}${disabled || busy ? ' pointer-events-none opacity-50' : ''}`;
    const title = busy ? `${label}…` : label;

    const content: ReactNode = (
        <ActionIcon name={icon} className="h-4 w-4" />
    );

    if (href && !disabled && !busy) {
        return (
            <Link href={href} className={className} title={title} aria-label={title}>
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={className}
            title={title}
            aria-label={title}
            disabled={disabled || busy}
            onClick={onClick}
        >
            {content}
        </button>
    );
}
