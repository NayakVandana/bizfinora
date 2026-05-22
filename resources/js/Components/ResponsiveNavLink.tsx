import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 text-sm font-medium transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground focus:border-sidebar-primary focus:bg-sidebar-accent'
                    : 'border-transparent text-sidebar-foreground hover:border-border hover:bg-muted hover:text-foreground focus:border-border focus:bg-muted'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
