import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useAuthUser } from '@/auth/useAuthUser';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { CompanySellerProfile } from '@/invoices/types';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import CurrentWorkspaceProfile from './CurrentWorkspaceProfile';

function companyInitial(name: string): string {
    const trimmed = name.trim();

    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export default function CompanyProfilePanel() {
    const { currentCompany, loading: authLoading } = useAuthUser();
    const [profile, setProfile] = useState<CompanySellerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!currentCompany) {
            setProfile(null);
            setLoading(false);

            return;
        }

        setLoading(true);
        void companyApiPost<ApiEnvelope<CompanySellerProfile>>(
            '/company/company-show',
            {},
        )
            .then((res) => {
                if (res.success && res.data) {
                    setProfile(res.data);
                    setError(null);
                } else {
                    setProfile(null);
                    setError(res.message ?? 'Could not load company profile.');
                }
            })
            .finally(() => setLoading(false));
    }, [authLoading, currentCompany?.id]);

    const displayName =
        profile?.name?.trim() ||
        currentCompany?.name ||
        'Company';

    if (!currentCompany) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-2xl text-muted-foreground">
                    +
                </div>
                <p className="text-muted-foreground mt-4 text-sm">
                    No company selected yet. Use{' '}
                    <strong className="font-medium text-foreground">
                        New company
                    </strong>{' '}
                    in the header company menu.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-14 animate-pulse rounded-lg bg-muted"
                    />
                ))}
            </div>
        );
    }

    if (!profile) {
        return (
            <p className="rounded-lg border border-dashed border-border bg-muted px-4 py-3 text-sm text-destructive">
                {error ?? 'Could not load company profile.'}
            </p>
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                <div className="flex min-w-0 gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sidebar-primary text-xl font-semibold text-sidebar-primary-foreground">
                        {companyInitial(displayName)}
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                            {displayName}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {currentCompany.role ?? 'Member'}
                        </p>
                    </div>
                </div>
                <Link href={route('companies.edit')}>
                    <PrimaryButton type="button">Edit profile</PrimaryButton>
                </Link>
            </div>

            <div className="mt-5">
                <CurrentWorkspaceProfile profile={profile} />
                <div className="mt-6 flex flex-wrap gap-2">
                    <Link href={route('invoices.create')}>
                        <SecondaryButton type="button">
                            Create invoice
                        </SecondaryButton>
                    </Link>
                </div>
            </div>
        </>
    );
}
