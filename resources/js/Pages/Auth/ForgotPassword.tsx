import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600">
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
                className="text-sm text-gray-600 underline hover:text-gray-900"
            >
                Back to login
            </Link>
        </GuestLayout>
    );
}
