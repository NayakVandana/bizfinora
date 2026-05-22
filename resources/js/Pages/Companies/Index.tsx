import ListingIndex from '@/Components/ListingIndex';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';
import CompanyProfilePanel from './CompanyProfilePanel';

function companyInitial(name: string): string {
    const trimmed = name.trim();

    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function WorkspaceCardShell({
    title,
    subtitle,
    accent = false,
    children,
}: {
    title: string;
    subtitle?: string;
    accent?: boolean;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm flex h-full min-h-0 flex-col rounded-2xl">
            <div
                className={`shrink-0 border-b border-border px-5 py-4 sm:px-6 ${
                    accent
                        ? 'bg-gradient-to-r from-sidebar-accent via-card to-card'
                        : 'bg-muted text-muted-foreground'
                }`}
            >
                <p
                    className={`text-xs font-medium ${
                        accent
                            ? 'text-sidebar-primary'
                            : 'text-muted-foreground'
                    }`}
                >
                    {title}
                </p>
                {subtitle ? (
                    <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
                ) : null}
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
                {children}
            </div>
        </section>
    );
}

export default function CompaniesIndex() {
    const { companies, currentCompany } = useAuthUser();
    const otherCompanies = companies.filter((c) => !c.is_current);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Company profile
                </h2>
            }
        >
            <Head title="Company profile" />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <p className="text-muted-foreground mb-6 max-w-2xl text-sm">
                        Seller details for your active workspace. Switch
                        company or add a new one from the{' '}
                        <strong className="font-medium text-foreground">
                            company menu in the header
                        </strong>
                        . Choose which fields appear on invoices in the
                        builder.
                    </p>

                    <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch xl:gap-8">
                        <WorkspaceCardShell
                            title="Current workspace"
                            accent
                        >
                            <CompanyProfilePanel />
                        </WorkspaceCardShell>

                        <WorkspaceCardShell
                            title="Other workspaces"
                            subtitle={
                                otherCompanies.length === 0
                                    ? 'You only have one workspace.'
                                    : `${otherCompanies.length} more · switch from header`
                            }
                        >
                            {otherCompanies.length > 0 ? (
                                <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-1 lg:max-h-[min(32rem,70vh)]">
                                    {otherCompanies.map((company, index) => (
                                        <li key={company.id}>
                                            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-4 sm:gap-4 sm:py-3.5">
                                                <div className="w-8 shrink-0 text-center">
                                                    <ListingIndex
                                                        index={index}
                                                        variant="mobile"
                                                    />
                                                </div>
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card text-sm font-semibold text-muted-foreground shadow-sm ring-1 ring-border">
                                                    {companyInitial(
                                                        company.name,
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-foreground font-medium">
                                                        {company.name}
                                                    </p>
                                                    <p className="text-muted-foreground text-sm capitalize">
                                                        {company.role ??
                                                            'member'}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted px-6 py-12 text-center">
                                    <p className="text-muted-foreground text-sm">
                                        {companies.length > 0
                                            ? 'Add another workspace from the company menu in the header.'
                                            : 'Use New company in the header company menu to get started.'}
                                    </p>
                                </div>
                            )}
                        </WorkspaceCardShell>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
