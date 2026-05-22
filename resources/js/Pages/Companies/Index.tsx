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
        <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div
                className={`shrink-0 border-b border-slate-100 px-5 py-4 sm:px-6 ${
                    accent
                        ? 'bg-gradient-to-r from-indigo-50/90 via-white to-white'
                        : 'bg-slate-50/50'
                }`}
            >
                <p
                    className={`text-xs font-medium ${
                        accent ? 'text-indigo-600' : 'text-slate-500'
                    }`}
                >
                    {title}
                </p>
                {subtitle ? (
                    <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
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
                <h2 className="text-xl font-semibold text-gray-900">
                    Company profile
                </h2>
            }
        >
            <Head title="Company profile" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
                    <p className="mb-6 max-w-2xl text-sm text-slate-600">
                        Seller details for your active workspace. Switch
                        company or add a new one from the{' '}
                        <strong className="font-medium text-slate-800">
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
                                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4 sm:gap-4 sm:py-3.5">
                                                <div className="w-8 shrink-0 text-center">
                                                    <ListingIndex
                                                        index={index}
                                                        variant="mobile"
                                                    />
                                                </div>
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                                                    {companyInitial(
                                                        company.name,
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-slate-900">
                                                        {company.name}
                                                    </p>
                                                    <p className="text-sm capitalize text-slate-500">
                                                        {company.role ??
                                                            'member'}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                                    <p className="text-sm text-slate-600">
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
