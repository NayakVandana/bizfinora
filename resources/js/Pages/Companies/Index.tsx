import ListingIndex from '@/Components/ListingIndex';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { companyApiPost } from '@/api/invoiceClient';
import type { ApiEnvelope } from '@/api/invoiceClient';
import type { CompanySellerProfile } from '@/invoices/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';
import CurrentWorkspaceProfile from './CurrentWorkspaceProfile';

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
    const { companies, currentCompany, loading: authLoading } = useAuthUser();
    const [profile, setProfile] = useState<CompanySellerProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        if (authLoading || !currentCompany) {
            setProfile(null);
            setProfileLoading(false);

            return;
        }

        setProfileLoading(true);
        void companyApiPost<ApiEnvelope<CompanySellerProfile>>(
            '/company/company-show',
            {},
        )
            .then((res) => {
                setProfile(res.success && res.data ? res.data : null);
            })
            .finally(() => setProfileLoading(false));
    }, [authLoading, currentCompany?.id]);

    const otherCompanies = companies.filter((c) => !c.is_current);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-900">
                    Companies
                </h2>
            }
        >
            <Head title="Companies" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-2xl text-sm text-slate-600">
                            Manage workspaces for invoicing. To change the
                            active company, use the{' '}
                            <strong className="font-medium text-slate-800">
                                company menu in the header
                            </strong>
                            .
                        </p>
                        <Link
                            href={route('companies.create')}
                            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 sm:w-auto"
                        >
                            <span className="text-lg leading-none">+</span>
                            New company
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch xl:gap-8">
                    {/* Current workspace */}
                    <WorkspaceCardShell
                        title="Current workspace"
                        accent
                    >
                            {!currentCompany ? (
                                <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-400">
                                        +
                                    </div>
                                    <p className="mt-4 text-sm text-slate-600">
                                        No company selected yet.
                                    </p>
                                    <Link
                                        href={route('companies.create')}
                                        className="mt-4 inline-flex rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                    >
                                        Create your first company
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="flex gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-semibold text-white shadow-md shadow-indigo-200">
                                            {companyInitial(
                                                currentCompany.name,
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                                                {currentCompany.name}
                                            </h3>
                                            <p className="mt-0.5 text-sm text-slate-500">
                                                {currentCompany.role ??
                                                    'Member'}
                                            </p>
                                            <Link
                                                href={route(
                                                    'companies.profile',
                                                )}
                                                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                Edit seller profile
                                                <span aria-hidden>→</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {profileLoading ? (
                                        <div className="mt-5 grid flex-1 gap-2 sm:grid-cols-2">
                                            {Array.from({ length: 10 }).map(
                                                (_, i) => (
                                                    <div
                                                        key={i}
                                                        className="h-14 animate-pulse rounded-lg bg-slate-100"
                                                    />
                                                ),
                                            )}
                                        </div>
                                    ) : profile ? (
                                        <CurrentWorkspaceProfile
                                            profile={profile}
                                        />
                                    ) : (
                                        <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                            Could not load workspace details.{' '}
                                            <Link
                                                href={route(
                                                    'companies.profile',
                                                )}
                                                className="font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                Open profile
                                            </Link>
                                        </p>
                                    )}
                                </>
                            )}
                    </WorkspaceCardShell>

                    {/* Other workspaces */}
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
                                                {companyInitial(company.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-slate-900">
                                                    {company.name}
                                                </p>
                                                <p className="text-sm capitalize text-slate-500">
                                                    {company.role ?? 'member'}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : companies.length > 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-12 text-center">
                                <p className="text-sm text-slate-600">
                                    Add another business workspace anytime.
                                </p>
                                <Link
                                    href={route('companies.create')}
                                    className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
                                >
                                    Create workspace
                                </Link>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center text-sm text-slate-500">
                                No companies yet.{' '}
                                <Link
                                    href={route('companies.create')}
                                    className="font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                    Create one
                                </Link>
                            </div>
                        )}
                    </WorkspaceCardShell>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
