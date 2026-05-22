import ApplicationLogo from '@/Components/ApplicationLogo';
import SidebarNavMain from '@/Components/sidebar/SidebarNavMain';
import { SidebarIcon } from '@/Layouts/sidebarIcons';
import { Link } from '@inertiajs/react';

type AppSidebarProps = {
    collapsed: boolean;
    onToggleCollapsed: () => void;
    onNavigate?: () => void;
    onLogoClick?: () => void;
};

export default function AppSidebar({
    collapsed,
    onToggleCollapsed,
    onNavigate,
    onLogoClick,
}: AppSidebarProps) {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className={collapsed ? 'p-1.5' : 'p-2'}>
                <Link
                    href={route('dashboard')}
                    onClick={onLogoClick}
                    title="Dashboard"
                    className={`flex items-center overflow-hidden rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        collapsed
                            ? 'h-9 w-full justify-center'
                            : 'h-10 gap-2 px-2'
                    }`}
                >
                    <ApplicationLogo
                        className={`block shrink-0 fill-current ${collapsed ? 'h-6 w-6' : 'h-6 w-auto'}`}
                    />
                </Link>
            </div>

            <SidebarNavMain collapsed={collapsed} onNavigate={onNavigate} />

            <div className={`shrink-0 border-t border-sidebar-border ${collapsed ? 'p-1.5' : 'p-2'}`}>
                <button
                    type="button"
                    onClick={onToggleCollapsed}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    className={`flex h-8 w-full items-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        collapsed ? 'justify-center' : 'gap-2 px-2 text-xs font-medium'
                    }`}
                >
                    {collapsed ? (
                        <SidebarIcon name="panelOpen" className="h-4 w-4" />
                    ) : (
                        <>
                            <SidebarIcon
                                name="panelClose"
                                className="h-4 w-4 shrink-0"
                            />
                            <span>Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
