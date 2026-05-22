import type { User } from '@/types';

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
        <div className="rounded-lg bg-slate-50/80 px-3 py-2.5">
            <p className="text-xs text-slate-500">{label}</p>
            <p
                className={`mt-0.5 text-sm ${
                    empty
                        ? 'text-slate-400'
                        : 'font-medium text-slate-900'
                } ${multiline ? 'break-words whitespace-pre-wrap' : ''}`}
            >
                {value}
            </p>
        </div>
    );
}

type Props = {
    user: User;
};

export default function UserProfileDetails({ user }: Props) {
    return (
        <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
                <ProfileMeta label="Name" value={displayValue(user.name)} />
                <ProfileMeta label="Email" value={displayValue(user.email)} />
            </div>

            <ProfileMeta
                label="Address"
                value={displayValue(user.address)}
                multiline
            />

            <div className="grid gap-2 sm:grid-cols-3">
                <ProfileMeta label="City" value={displayValue(user.city)} />
                <ProfileMeta label="State" value={displayValue(user.state)} />
                <ProfileMeta
                    label="Postal code"
                    value={displayValue(user.postal_code)}
                />
            </div>

            {user.email_verified_at ? (
                <ProfileMeta
                    label="Email verification"
                    value="Verified"
                />
            ) : (
                <ProfileMeta
                    label="Email verification"
                    value="Not verified"
                />
            )}
        </div>
    );
}
