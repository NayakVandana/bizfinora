import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { userApiPost, type ApiEnvelope } from '@/api/userClient';
import { useAuthUser } from '@/auth/useAuthUser';
import type { Company } from '@/types';
import { Head } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function CompaniesIndex() {
    const { companies, refresh } = useAuthUser();
    const [name, setName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<string | null>(null);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus(null);

        try {
            const res = await userApiPost<ApiEnvelope<Company>>(
                '/companies/company-store',
                { name },
            );

            if (!res.success) {
                setErrors({ name: res.message });

                return;
            }

            setName('');
            setStatus('Company created and set as active.');
            await refresh();
        } catch {
            setErrors({ name: 'Could not create company.' });
        } finally {
            setProcessing(false);
        }
    };

    const switchCompany = async (company: Company) => {
        if (company.is_current) {
            return;
        }

        const res = await userApiPost<ApiEnvelope<Company>>(
            '/companies/company-switch',
            { id: company.id },
        );

        if (res.success) {
            await refresh();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Companies
                </h2>
            }
        >
            <Head title="Companies" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {status && (
                        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {status}
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Your companies
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Switch the active company from the header or
                                below.
                            </p>
                        </div>

                        <ul className="divide-y divide-gray-200">
                            {companies.map((company) => (
                                <li
                                    key={company.id}
                                    className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {company.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {company.slug} · {company.role}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                    {company.is_current ? (
                                        <>
                                        <a
                                            href={route('companies.profile')}
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            Edit profile
                                        </a>
                                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                                            Active
                                        </span>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void switchCompany(company)
                                            }
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                        >
                                            Switch to this company
                                        </button>
                                    )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Create another company
                            </h3>
                        </div>

                        <form onSubmit={submit} className="space-y-4 px-6 py-6">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Company name"
                                />

                                <TextInput
                                    id="name"
                                    name="name"
                                    value={name}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />

                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <PrimaryButton disabled={processing}>
                                Create company
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
