import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function ProfileEdit() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold leading-tight">
                    Edit user profile
                </h2>
            }
        >
            <Head title="Edit user profile" />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('profile.information')}
                        className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1 text-sm"
                    >
                        ← User profile
                    </Link>

                    <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm mt-6 p-5 sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={false}
                            redirectOnSave
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
