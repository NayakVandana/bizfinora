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
                <h2 className="text-foreground text-xl font-semibold">
                    New company
                </h2>
            }
        >
            <Head title="New company" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-2xl px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('companies.index')}
                        className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1 text-sm"
                    >
                        ← Company profile
                    </Link>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm mt-6">
                        <div className="border-b border-border px-5 py-4 sm:px-6">
                            <h3 className="text-foreground font-semibold">
                                Workspace & seller profile
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
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

                            <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {processing
                                        ? 'Creating…'
                                        : 'Create workspace'}
                                </button>
                                <Link
                                    href={route('companies.index')}
                                    className="text-muted-foreground text-center text-sm font-medium hover:text-foreground sm:text-left"
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
