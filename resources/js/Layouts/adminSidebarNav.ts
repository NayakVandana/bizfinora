import type { SidebarIconName } from '@/Layouts/sidebarIcons';
import type { NavSection } from '@/Layouts/sidebarNav';

export function adminSidebarNavSections(): NavSection[] {
    return [
        {
            links: [
                {
                    href: route('admin.dashboard'),
                    label: 'Dashboard',
                    icon: 'dashboard',
                    isActive: () =>
                        Boolean(route().current('admin.dashboard')),
                },
                {
                    href: route('admin.users.index'),
                    label: 'Users',
                    icon: 'user',
                    isActive: () =>
                        Boolean(
                            route().current('admin.users.index') ||
                                route().current('admin.users.show'),
                        ),
                },
                {
                    href: route('admin.companies.index'),
                    label: 'Companies',
                    icon: 'building',
                    isActive: () =>
                        Boolean(
                            route().current('admin.companies.index') ||
                                route().current('admin.companies.show'),
                        ),
                },
            ],
        },
    ];
}

export type { SidebarIconName };
