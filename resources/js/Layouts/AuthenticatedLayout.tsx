import ApplicationLogo from '@/Components/ApplicationLogo';
import CompanySwitcher from '@/Components/CompanySwitcher';
import Dropdown from '@/Components/Dropdown';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { useAuthUser } from '@/auth/useAuthUser';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import { requireAuthPage } from '@/utils/requireAuth';

type NavLinkItem = {
    type: 'link';
    href: string;
    label: string;
    isActive: () => boolean;
};

type NavHeading = {
    type: 'heading';
    label: string;
};

type NavEntry = NavLinkItem | NavHeading;

function useNavEntries(): NavEntry[] {
    return [
        {
            type: 'link',
            href: route('dashboard'),
            label: 'Dashboard',
            isActive: () => Boolean(route().current('dashboard')),
        },
        {
            type: 'link',
            href: route('companies.index'),
            label: 'Companies',
            isActive: () => Boolean(route().current('companies.index')),
        },
        {
            type: 'link',
            href: route('buyers.index'),
            label: 'Buyers',
            isActive: () => Boolean(route().current('buyers.index')),
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
    ];
}

function SidebarNav({
    entries,
    onNavigate,
}: {
    entries: NavEntry[];
    onNavigate?: () => void;
}) {
    return (
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
            {entries.map((entry) =>
                entry.type === 'heading' ? (
                    <p
                        key={entry.label}
                        className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400 first:mt-0"
                    >
                        {entry.label}
                    </p>
                ) : (
                    <ResponsiveNavLink
                        key={entry.label}
                        href={entry.href}
                        active={entry.isActive()}
                        onClick={onNavigate}
                    >
                        {entry.label}
                    </ResponsiveNavLink>
                ),
            )}
        </nav>
    );
}

function UserMenu({ onLogout }: { onLogout: () => void }) {
    const { user } = useAuthUser();

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <span className="inline-flex rounded-md">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                    >
                        {user?.name}
                        <svg
                            className="-me-0.5 ms-2 h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </span>
            </Dropdown.Trigger>
            <Dropdown.Content>
                <Dropdown.Link href={route('profile.edit')}>
                    Profile
                </Dropdown.Link>
                <button
                    type="button"
                    onClick={onLogout}
                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                    Log Out
                </button>
            </Dropdown.Content>
        </Dropdown>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, loading, logout } = useAuthUser();
    const navEntries = useNavEntries();

    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        if (!loading) {
            requireAuthPage();
        }
    }, [loading]);

    const handleLogout = async () => {
        await logout();
        router.visit(route('login'));
    };

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-500">
                Loading…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 lg:flex">
            {/* Desktop sidebar */}
            <aside className="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
                <div className="flex h-16 items-center border-b border-gray-100 px-4">
                    <Link href={route('dashboard')}>
                        <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800" />
                    </Link>
                </div>
                <SidebarNav entries={navEntries} />
            </aside>

            {/* Mobile sidebar overlay */}
            {mobileNavOpen ? (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    role="presentation"
                    onClick={() => setMobileNavOpen(false)}
                >
                    <div className="absolute inset-0 bg-gray-600/50" />
                    <aside
                        className="relative flex h-full w-56 flex-col bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
                            <Link
                                href={route('dashboard')}
                                onClick={() => setMobileNavOpen(false)}
                            >
                                <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileNavOpen(false)}
                                className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Close menu"
                            >
                                <svg
                                    className="h-5 w-5"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <SidebarNav
                            entries={navEntries}
                            onNavigate={() => setMobileNavOpen(false)}
                        />
                        <div className="border-t border-gray-200 px-4 py-3">
                            <CompanySwitcher />
                        </div>
                        <div className="mt-auto border-t border-gray-200 px-4 py-4">
                            <p className="text-sm font-medium text-gray-800">
                                {user.name}
                            </p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                            <div className="mt-2 space-y-1">
                                <ResponsiveNavLink
                                    href={route('profile.edit')}
                                    onClick={() => setMobileNavOpen(false)}
                                >
                                    Profile
                                </ResponsiveNavLink>
                                <button
                                    type="button"
                                    onClick={() => void handleLogout()}
                                    className="block w-full px-4 py-2 text-start text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex min-h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(true)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                            aria-label="Open menu"
                        >
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        {header ? (
                            <div className="min-w-0 flex-1">{header}</div>
                        ) : (
                            <Link
                                href={route('dashboard')}
                                className="lg:hidden"
                            >
                                <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800" />
                            </Link>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <CompanySwitcher />
                        <UserMenu onLogout={() => void handleLogout()} />
                    </div>
                </header>

                <main className="flex-1">{children}</main>
            </div>
        </div>
    );
}
