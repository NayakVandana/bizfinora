import ListingIndex from '@/Components/ListingIndex';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { companyApiPost } from '@/api/invoiceClient';
import type { ApiEnvelope } from '@/api/invoiceClient';
import type { CompanySellerProfile } from '@/invoices/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, type ReactNode } from 'react';

function companyInitial(name: string): string {
    const trimmed = name.trim();

    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function ProfileMeta({
    icon,
    label,
    value,
    multiline = false,
}: {
    icon: ReactNode;
    label: string;
    value: string;
    multiline?: boolean;
}) {
    return (
        <div className="flex gap-3 rounded-lg bg-slate-50/80 px-3 py-2.5">
            <div className="mt-0.5 shrink-0 text-slate-400">{icon}</div>
            <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">{label}</p>
                <p
                    className={`text-sm font-medium text-slate-900 ${
                        multiline ? 'break-words' : 'truncate'
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
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
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-14 animate-pulse rounded-lg bg-slate-100"
                                                />
                                            ))}
                                        </div>
                                    ) : profile ? (
                                        <div className="mt-5 grid gap-2 md:grid-cols-2">
                                            {profile.email?.trim() ? (
                                                <ProfileMeta
                                                    label="Email"
                                                    value={profile.email}
                                                    icon={
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            ) : null}
                                            {profile.phone?.trim() ? (
                                                <ProfileMeta
                                                    label="Phone"
                                                    value={profile.phone}
                                                    icon={
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372M2.25 6.75l7.5 7.5 7.5-7.5"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            ) : null}
                                            {profile.gst?.trim() ? (
                                                <ProfileMeta
                                                    label="GSTIN"
                                                    value={profile.gst}
                                                    icon={
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c1.07 0 2.04.174 2.922.48M6.75 3h7.5v1.5H6.75V3z"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            ) : null}
                                            {profile.pan?.trim() ? (
                                                <ProfileMeta
                                                    label="PAN"
                                                    value={profile.pan}
                                                    icon={
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c1.07 0 2.04.174 2.922.48M6.75 3h7.5v1.5H6.75V3z"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            ) : null}
                                            {profile.address?.trim() ? (
                                                <ProfileMeta
                                                    label="Address"
                                                    value={profile.address}
                                                    multiline
                                                    icon={
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={1.5}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            ) : null}
                                        </div>
                                    ) : (
                                        <p className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                            Add seller details so they appear on
                                            your invoices.
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
