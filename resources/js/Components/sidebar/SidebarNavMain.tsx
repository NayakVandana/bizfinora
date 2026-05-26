import { SidebarIcon, type SidebarIconName } from '@/Layouts/sidebarIcons';
import {
    sidebarNavSections,
    type NavSection,
} from '@/Layouts/sidebarNav';
import { useAuthUser } from '@/auth/useAuthUser';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

function SidebarMenuButton({
    href,
    icon,
    active,
    collapsed,
    children,
    onClick,
}: {
    href: string;
    icon: SidebarIconName;
    active: boolean;
    collapsed: boolean;
    children: ReactNode;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            title={collapsed ? String(children) : undefined}
            className={`flex h-8 w-full min-w-0 items-center overflow-hidden rounded-md text-sm transition-colors ${
                collapsed ? 'justify-center px-0' : 'gap-2 p-2'
            } ${
                active
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
        >
            <SidebarIcon name={icon} className="h-4 w-4 shrink-0" />
            {!collapsed ? <span className="truncate">{children}</span> : null}
        </Link>
    );
}

function SidebarGroup({
    label,
    collapsed,
    children,
}: {
    label?: string;
    collapsed: boolean;
    children: ReactNode;
}) {
    return (
        <div
            className={`relative flex w-full min-w-0 flex-col ${collapsed ? 'px-1 py-1' : 'p-1.5'}`}
        >
            {label && !collapsed ? (
                <div className="mb-1 flex h-7 shrink-0 items-center px-2 text-[11px] font-medium text-sidebar-foreground/60">
                    {label}
                </div>
            ) : label && collapsed ? (
                <div
                    className="mx-auto mb-1 h-px w-5 bg-sidebar-border"
                    role="separator"
                />
            ) : null}
            <ul className="flex w-full min-w-0 flex-col gap-0.5">{children}</ul>
        </div>
    );
}

export default function SidebarNavMain({
    collapsed,
    onNavigate,
    sections,
}: {
    collapsed: boolean;
    onNavigate?: () => void;
    sections?: NavSection[];
}) {
    const { user } = useAuthUser();
    const navSections =
        sections ??
        sidebarNavSections({ isAdmin: Boolean(user?.is_admin) });

    return (
        <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {navSections.map((section) => (
                <SidebarGroup
                    key={section.title ?? 'main'}
                    label={section.title}
                    collapsed={collapsed}
                >
                    {section.links.map((link) => (
                        <li key={link.href}>
                            <SidebarMenuButton
                                href={link.href}
                                icon={link.icon}
                                active={link.isActive()}
                                collapsed={collapsed}
                                onClick={onNavigate}
                            >
                                {link.label}
                            </SidebarMenuButton>
                        </li>
                    ))}
                </SidebarGroup>
            ))}
        </div>
    );
}
