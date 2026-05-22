import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { userApiPost, type ApiEnvelope } from '@/api/userClient';
import { useAuthUser } from '@/auth/useAuthUser';
import type { User } from '@/types';
import { Transition } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
    redirectOnSave = false,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
    redirectOnSave?: boolean;
}) {
    const { user, refresh } = useAuthUser();
    const [name, setName] = useState(user?.name ?? '');
    const [email, setEmail] = useState(user?.email ?? '');
    const [address, setAddress] = useState(user?.address ?? '');
    const [city, setCity] = useState(user?.city ?? '');
    const [state, setState] = useState(user?.state ?? '');
    const [postalCode, setPostalCode] = useState(user?.postal_code ?? '');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setRecentlySuccessful(false);

        try {
            const res = await userApiPost<ApiEnvelope<User>>(
                '/profile/profile-update',
                {
                    name,
                    email,
                    address,
                    city,
                    state,
                    postal_code: postalCode,
                },
            );

            if (!res.success) {
                const data = res.data as unknown as Record<
                    string,
                    unknown
                > | null;
                const next: Record<string, string> = {};
                if (data) {
                    for (const key of [
                        'name',
                        'email',
                        'address',
                        'city',
                        'state',
                        'postal_code',
                    ]) {
                        const val = data[key];
                        if (Array.isArray(val) && typeof val[0] === 'string') {
                            next[key] = val[0];
                        }
                    }
                }
                if (Object.keys(next).length === 0) {
                    next.email = res.message ?? 'Could not update profile.';
                }
                setErrors(next);

                return;
            }

            await refresh();

            if (redirectOnSave) {
                router.visit(route('profile.information'));
                return;
            }

            setRecentlySuccessful(true);
        } catch {
            setErrors({ email: 'Could not update profile.' });
        } finally {
            setProcessing(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <section className={className}>
            <p className="text-muted-foreground text-sm">
                Update your name, email, and address. Used for your login
                account (not the company seller on invoices).
            </p>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="address" value="Address" />
                    <textarea
                        id="address"
                        className="app-field !mt-1"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, building, area"
                    />
                    <InputError className="mt-2" message={errors.address} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                        <InputLabel htmlFor="city" value="City" />
                        <TextInput
                            id="city"
                            className="mt-1 block w-full"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.city} />
                    </div>
                    <div>
                        <InputLabel htmlFor="state" value="State" />
                        <TextInput
                            id="state"
                            className="mt-1 block w-full"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                        />
                        <InputError className="mt-2" message={errors.state} />
                    </div>
                    <div>
                        <InputLabel htmlFor="postal_code" value="Postal code" />
                        <TextInput
                            id="postal_code"
                            className="mt-1 block w-full"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                        <InputError
                            className="mt-2"
                            message={errors.postal_code}
                        />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Your email address is unverified.
                        </p>
                    </div>
                )}

                {status === 'verification-link-sent' && (
                    <div className="mt-2 text-sm font-medium text-green-600">
                        A new verification link has been sent to your email
                        address.
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-muted-foreground text-sm">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
