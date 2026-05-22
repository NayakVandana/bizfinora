import {
    isProfileRouteActive,
    profileMenuLinks,
} from '@/Pages/Profile/profileMenu';
import type { SidebarIconName } from '@/Layouts/sidebarIcons';

export type NavLinkItem = {
    href: string;
    label: string;
    icon: SidebarIconName;
    isActive: () => boolean;
};

export type NavSection = {
    title?: string;
    links: NavLinkItem[];
};

const profileIconByRoute: Record<string, SidebarIconName> = {
    'profile.information': 'user',
    'profile.password': 'key',
    'profile.appearance': 'palette',
};

export function sidebarNavSections(): NavSection[] {
    const profileLinks: NavLinkItem[] = profileMenuLinks.map((item) => ({
        href: route(item.routeName),
        label: item.label,
        icon: profileIconByRoute[item.routeName] ?? 'user',
        isActive: () => isProfileRouteActive(item.routeName),
    }));

    return [
        {
            links: [
                {
                    href: route('dashboard'),
                    label: 'Dashboard',
                    icon: 'dashboard',
                    isActive: () => Boolean(route().current('dashboard')),
                },
                {
                    href: route('buyers.index'),
                    label: 'Buyers',
                    icon: 'buyers',
                    isActive: () =>
                        Boolean(route().current()?.startsWith('buyers.')),
                },
                {
                    href: route('invoices.index'),
                    label: 'Invoices',
                    icon: 'invoices',
                    isActive: () =>
                        Boolean(route().current()?.startsWith('invoices.')),
                },
            ],
        },
        {
            title: 'Templates',
            links: [
                {
                    href: route('settings.templates.library'),
                    label: 'Library',
                    icon: 'library',
                    isActive: () =>
                        route().current() === 'settings.templates.library' ||
                        route().current() === 'settings.templates.edit',
                },
                {
                    href: route('settings.templates'),
                    label: 'Default',
                    icon: 'template',
                    isActive: () => route().current() === 'settings.templates',
                },
                {
                    href: route('settings.templates.preview'),
                    label: 'Preview',
                    icon: 'preview',
                    isActive: () =>
                        route().current() === 'settings.templates.preview',
                },
                {
                    href: route('settings.tax'),
                    label: 'Tax',
                    icon: 'tax',
                    isActive: () => Boolean(route().current('settings.tax')),
                },
            ],
        },
        {
            title: 'Profile',
            links: [
                ...profileLinks,
                {
                    href: route('companies.index'),
                    label: 'Company',
                    icon: 'building',
                    isActive: () => route().current() === 'companies.index',
                },
            ],
        },
    ];
}
