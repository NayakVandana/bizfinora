import type { CompanySellerProfile } from '@/invoices/types';

function displayValue(value?: string | null): string {
    const trimmed = value?.trim();

    return trimmed ? trimmed : '—';
}

function ProfileMeta({
    label,
    value,
    multiline = false,
}: {
    label: string;
    value: string;
    multiline?: boolean;
}) {
    const empty = value === '—';

    return (
        <div className="rounded-lg bg-muted px-3 py-2.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
                className={`${
                    empty ? 'mt-0.5 text-sm text-muted-foreground' : 'mt-0.5 text-sm font-medium text-foreground'
                } ${multiline ? 'break-words whitespace-pre-wrap' : ''}`}
            >
                {value}
            </p>
        </div>
    );
}

type Props = {
    profile: CompanySellerProfile;
};

export default function CurrentWorkspaceProfile({ profile }: Props) {
    return (
        <div className="mt-5 space-y-4">
            {profile.logo_data_url ? (
                <div className="rounded-lg bg-muted px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">Company logo</p>
                    <img
                        src={profile.logo_data_url}
                        alt={`${profile.name} logo`}
                        className="mt-2 h-16 max-w-full object-contain"
                    />
                </div>
            ) : (
                <ProfileMeta label="Company logo" value="—" />
            )}

            <div className="grid gap-2 sm:grid-cols-2">
                <ProfileMeta
                    label="Email"
                    value={displayValue(profile.email)}
                />
                <ProfileMeta
                    label="Phone"
                    value={displayValue(profile.phone)}
                />
                <ProfileMeta
                    label="GSTIN"
                    value={displayValue(profile.gst ?? profile.tax_id)}
                />
                <ProfileMeta
                    label="PAN"
                    value={displayValue(profile.pan)}
                />
                <ProfileMeta
                    label="Bank account"
                    value={displayValue(profile.account_number)}
                />
                <ProfileMeta
                    label="SWIFT / BIC"
                    value={displayValue(profile.swift_bic)}
                />
            </div>

            <ProfileMeta
                label="Address"
                value={displayValue(profile.address)}
                multiline
            />

            <div className="grid gap-2 sm:grid-cols-3">
                <ProfileMeta
                    label="City"
                    value={displayValue(profile.city)}
                />
                <ProfileMeta
                    label="State"
                    value={displayValue(profile.state)}
                />
                <ProfileMeta
                    label="Postal code"
                    value={displayValue(profile.postal_code)}
                />
            </div>

            <ProfileMeta
                label="Company notes"
                value={displayValue(profile.seller_notes)}
                multiline
            />
        </div>
    );
}
