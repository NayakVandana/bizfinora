import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useAuthUser } from '@/auth/useAuthUser';
import { userApiPost, type ApiEnvelope } from '@/api/userClient';
import type { Company } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import CompanyProfileFormFields from './CompanyProfileFormFields';
import {
    companyProfileFormPayload,
    emptyCompanyProfileForm,
    type CompanyProfileFormState,
} from './companyProfileForm';
import { mapCompanyProfileApiErrors } from './mapCompanyProfileApiErrors';
import {
    validateCompanyProfileForm,
    type CompanyProfileFieldErrors,
} from './validateCompanyProfileForm';

export default function CompaniesCreate() {
    const { refresh } = useAuthUser();
    const [form, setForm] = useState<CompanyProfileFormState>(
        emptyCompanyProfileForm,
    );
    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<CompanyProfileFieldErrors>(
        {},
    );

    const update = (patch: Partial<CompanyProfileFormState>) => {
        setForm((prev) => ({ ...prev, ...patch }));
    };

    const clearFieldError = (key: keyof CompanyProfileFieldErrors) => {
        setFieldErrors((prev) => {
            if (!prev[key]) {
                return prev;
            }
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setFormError(null);

        const clientErrors = validateCompanyProfileForm(form);
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setFormError('Please fix the highlighted fields.');
            return;
        }

        setProcessing(true);
        setFieldErrors({});

        const payload = companyProfileFormPayload(form);

        try {
            const res = await userApiPost<ApiEnvelope<Company>>(
                '/companies/company-store',
                payload,
            );

            if (!res.success) {
                const apiErrors = mapCompanyProfileApiErrors(
                    res.data as unknown as Record<string, unknown> | null,
                );
                if (Object.keys(apiErrors).length > 0) {
                    setFieldErrors(apiErrors);
                } else {
                    setFormError(res.message ?? 'Could not create company.');
                }

                return;
            }

            await refresh();
            router.visit(route('companies.index'));
        } catch {
            setFormError('Could not create company.');
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
                <div className="mx-auto max-w-2xl px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('companies.index')}
                        className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        ← Company profile
                    </Link>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                            <h3 className="font-semibold text-slate-900">
                                Workspace & seller profile
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Same details as your company profile — used as
                                the seller on invoices. You can change these
                                anytime after the workspace is created.
                            </p>
                        </div>

                        <form
                            noValidate
                            onSubmit={submit}
                            className="space-y-5 px-5 py-6 sm:px-6"
                        >
                            {formError ? (
                                <InputError message={formError} />
                            ) : null}

                            <CompanyProfileFormFields
                                form={form}
                                errors={fieldErrors}
                                onChange={update}
                                onClearError={clearFieldError}
                            />

                            <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
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
