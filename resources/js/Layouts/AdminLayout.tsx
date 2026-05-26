import AdminSidebar from '@/Components/AdminSidebar';
import Dropdown from '@/Components/Dropdown';
import { useAdminAuth } from '@/auth/useAdminAuth';
import { getAdminApiToken, getUserApiToken } from '@/auth/authToken';
import { useSidebarCollapsed } from '@/hooks/useSidebarCollapsed';
import { Link, router } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

function AdminUserMenu({ onLogout }: { onLogout: () => void }) {
    const { user } = useAdminAuth();

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <span className="inline-flex rounded-md">
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium leading-4 text-foreground transition hover:bg-muted focus:outline-none"
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
                <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {user?.email}
                </p>
                <div className="my-1 border-t border-border" />
                <button
                    type="button"
                    onClick={onLogout}
                    className="block w-full px-4 py-2 text-start text-sm leading-5 text-popover-foreground transition hover:bg-muted focus:bg-muted focus:outline-none"
                >
                    Log out
                </button>
            </Dropdown.Content>
        </Dropdown>
    );
}

export default function AdminLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { user, loading, logout } = useAdminAuth();
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const { collapsed, toggle: toggleSidebar } = useSidebarCollapsed();

    useEffect(() => {
        if (loading) {
            return;
        }

        if (!user) {
            router.visit(
                getUserApiToken() || getAdminApiToken()
                    ? route('dashboard')
                    : route('admin.login'),
            );
        }
    }, [loading, user]);

    const handleLogout = async () => {
        await logout();
        router.visit(
            getUserApiToken() ? route('dashboard') : route('admin.login'),
        );
    };

    if (loading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
                Loading…
            </div>
        );
    }

    const closeMobile = () => setMobileNavOpen(false);

    return (
        <div className="flex min-h-svh w-full bg-background text-foreground">
            <aside
                className={`hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out lg:flex ${
                    collapsed ? 'w-[3.25rem]' : 'w-44'
                }`}
            >
                <AdminSidebar
                    collapsed={collapsed}
                    onToggleCollapsed={toggleSidebar}
                />
            </aside>

            <div className="flex min-h-svh min-w-0 flex-1 flex-col">
                <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-background px-4 py-2 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileNavOpen(true)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
                            aria-label="Open menu"
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        {header ? (
                            <div className="min-w-0 flex-1 text-foreground">
                                {header}
                            </div>
                        ) : (
                            <Link
                                href={route('admin.dashboard')}
                                className="text-sm font-semibold uppercase tracking-wide text-muted-foreground lg:hidden"
                            >
                                Admin
                            </Link>
                        )}
                    </div>
                    <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:gap-3">
                        <Link
                            href={route('dashboard')}
                            className="hidden text-sm font-medium text-sidebar-primary hover:opacity-80 sm:inline"
                        >
                            Main app
                        </Link>
                        <AdminUserMenu onLogout={() => void handleLogout()} />
                    </div>
                </header>

                <main className="min-h-0 flex-1 overflow-auto">{children}</main>
            </div>

            {mobileNavOpen ? (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    role="presentation"
                    onClick={closeMobile}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <aside
                        className="relative flex h-full w-[min(18rem,85vw)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={closeMobile}
                            className="absolute end-3 top-3 z-10 rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent"
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
                        <AdminSidebar
                            collapsed={false}
                            onToggleCollapsed={toggleSidebar}
                            onNavigate={closeMobile}
                            onLogoClick={closeMobile}
                        />
                    </aside>
                </div>
            ) : null}
        </div>
    );
}
