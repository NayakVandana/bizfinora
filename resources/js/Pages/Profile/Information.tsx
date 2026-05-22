import PrimaryButton from '@/Components/PrimaryButton';
import { useAuthUser } from '@/auth/useAuthUser';
import { Link } from '@inertiajs/react';
import ProfileLayout from './ProfileLayout';
import UserProfileDetails from './UserProfileDetails';

function userInitial(name: string): string {
    const trimmed = name.trim();

    return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export default function ProfileInformation() {
    const { user, loading } = useAuthUser();

    return (
        <ProfileLayout title="User profile" headTitle="User profile">
            {loading || !user ? (
                <p className="text-sm text-gray-500">Loading…</p>
            ) : (
                <>
                    <p className="text-sm text-gray-600">
                        Your login account details. Company seller information
                        is managed under{' '}
                        <Link
                            href={route('companies.index')}
                            className="font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Company profile
                        </Link>
                        .
                    </p>

                    <div className="mt-6 flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
                        <div className="flex min-w-0 gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-lg font-semibold text-white">
                                {userInitial(user.name)}
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {user.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <Link href={route('profile.information.edit')}>
                            <PrimaryButton type="button">
                                Edit profile
                            </PrimaryButton>
                        </Link>
                    </div>

                    <div className="mt-6">
                        <UserProfileDetails user={user} />
                    </div>
                </>
            )}
        </ProfileLayout>
    );
}
