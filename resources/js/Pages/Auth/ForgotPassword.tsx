import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="text-muted-foreground mb-4 text-sm">
                Password reset will be available via API soon. For now, contact
                your administrator or use a seeded test account.
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <Link
                href={route('login')}
                className="font-medium text-sidebar-primary hover:opacity-80 text-sm underline"
            >
                Back to login
            </Link>
        </GuestLayout>
    );
}
