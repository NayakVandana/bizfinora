import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    const { user, currentCompany, companies } = useAuthUser();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <p>
                                Welcome, <strong>{user?.name}</strong>.
                            </p>

                            {currentCompany ? (
                                <p className="mt-2">
                                    Active company:{' '}
                                    <strong>{currentCompany.name}</strong>
                                </p>
                            ) : (
                                <p className="mt-2 text-amber-700">
                                    No active company selected.{' '}
                                    <Link
                                        href={route('companies.index')}
                                        className="underline"
                                    >
                                        Create or select a company
                                    </Link>
                                    .
                                </p>
                            )}

                            <p className="mt-4 text-sm text-gray-600">
                                You belong to {companies.length}{' '}
                                {companies.length === 1
                                    ? 'company'
                                    : 'companies'}
                                . Use the company menu in the header to switch,
                                or{' '}
                                <Link
                                    href={route('companies.index')}
                                    className="text-indigo-600 underline hover:text-indigo-800"
                                >
                                    manage companies
                                </Link>{' '}
                                or{' '}
                                <Link
                                    href={route('invoices.create')}
                                    className="text-indigo-600 underline hover:text-indigo-800"
                                >
                                    create an invoice
                                </Link>
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
