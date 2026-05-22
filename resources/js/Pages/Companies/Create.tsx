import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { userApiPost, type ApiEnvelope } from '@/api/userClient';
import type { Company } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function CompaniesCreate() {
    const { refresh } = useAuthUser();
    const [name, setName] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const res = await userApiPost<ApiEnvelope<Company>>(
                '/companies/company-store',
                { name },
            );

            if (!res.success) {
                setErrors({ name: res.message });

                return;
            }

            await refresh();
            router.visit(route('companies.index'));
        } catch {
            setErrors({ name: 'Could not create company.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-900">
                    New company
                </h2>
            }
        >
            <Head title="New company" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-lg px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('companies.index')}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to companies
                    </Link>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h3 className="font-semibold text-slate-900">
                                Workspace details
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                You can add logo, tax ID, and seller address on
                                the profile page after creating.
                            </p>
                        </div>

                        <form
                            onSubmit={submit}
                            className="space-y-5 px-5 py-6 sm:px-6"
                        >
                            <div>
                                <InputLabel htmlFor="name" value="Company name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={name}
                                    className="mt-1.5 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    autoFocus
                                    placeholder="e.g. Acme Trading Pvt Ltd"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Creating…'
                                        : 'Create workspace'}
                                </button>
                                <Link
                                    href={route('companies.index')}
                                    className="text-center text-sm font-medium text-slate-600 hover:text-slate-900 sm:text-left"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
