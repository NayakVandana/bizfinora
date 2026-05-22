import {
    isProfileRouteActive,
    profileMenuLinks,
} from '@/Pages/Profile/profileMenu';

export type NavLinkItem = {
    type: 'link';
    href: string;
    label: string;
    isActive: () => boolean;
};

export type NavHeading = {
    type: 'heading';
    label: string;
};

export type NavEntry = NavLinkItem | NavHeading;

export function sidebarNavEntries(): NavEntry[] {
    const userProfileLinks: NavLinkItem[] = profileMenuLinks.map((item) => ({
        type: 'link',
        href: route(item.routeName),
        label: item.label,
        isActive: () => isProfileRouteActive(item.routeName),
    }));

    return [
        {
            type: 'link',
            href: route('dashboard'),
            label: 'Dashboard',
            isActive: () => Boolean(route().current('dashboard')),
        },
        {
            type: 'link',
            href: route('buyers.index'),
            label: 'Buyers',
            isActive: () =>
                Boolean(route().current()?.startsWith('buyers.')),
        },
        {
            type: 'link',
            href: route('invoices.index'),
            label: 'Invoices',
            isActive: () =>
                Boolean(route().current()?.startsWith('invoices.')),
        },
        { type: 'heading', label: 'Templates' },
        {
            type: 'link',
            href: route('settings.templates.library'),
            label: 'Template library',
            isActive: () =>
                route().current() === 'settings.templates.library' ||
                route().current() === 'settings.templates.edit',
        },
        {
            type: 'link',
            href: route('settings.templates'),
            label: 'Default template',
            isActive: () => route().current() === 'settings.templates',
        },
        {
            type: 'link',
            href: route('settings.templates.preview'),
            label: 'Preview',
            isActive: () =>
                route().current() === 'settings.templates.preview',
        },
        {
            type: 'link',
            href: route('settings.tax'),
            label: 'Tax',
            isActive: () => Boolean(route().current('settings.tax')),
        },
        { type: 'heading', label: 'User' },
        ...userProfileLinks,
        { type: 'heading', label: 'Company' },
        {
            type: 'link',
            href: route('companies.index'),
            label: 'Company profile',
            isActive: () => route().current() === 'companies.index',
        },
    ];
}
