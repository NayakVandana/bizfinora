import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useAdminAuth } from '@/auth/useAdminAuth';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

export default function AdminLogin() {
    const { isLoggedIn, login } = useAdminAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoggedIn) {
            router.visit(route('admin.dashboard'));
        }
    }, [isLoggedIn]);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError(null);

        try {
            const result = await login(email, password);
            if (!result.ok) {
                setError(result.message);

                return;
            }

            router.visit(route('admin.dashboard'));
        } catch {
            setError('Could not sign in.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Admin login" />

            <div className="mb-4 text-center">
                <p className="text-foreground text-lg font-semibold">
                    Admin sign in
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                    Platform operator access only
                </p>
            </div>

            {error ? (
                <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                </div>
            ) : null}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <PrimaryButton disabled={processing}>Sign in</PrimaryButton>
                </div>
            </form>

            <p className="text-muted-foreground mt-6 text-center text-sm">
                <Link
                    href={route('login')}
                    className="font-medium text-sidebar-primary hover:opacity-80 underline"
                >
                    Back to main app login
                </Link>
            </p>
        </GuestLayout>
    );
}
