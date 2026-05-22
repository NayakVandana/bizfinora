import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function ProfileEdit() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit user profile
                </h2>
            }
        >
            <Head title="Edit user profile" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-2xl px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('profile.information')}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        ← User profile
                    </Link>

                    <div className="mt-6 overflow-hidden rounded-xl bg-white p-5 shadow-sm sm:p-8">
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
