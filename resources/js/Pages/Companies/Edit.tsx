import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { CompanySellerProfile } from '@/invoices/types';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import CompanyProfileFormFields from './CompanyProfileFormFields';
import {
    companyProfileFormFromApi,
    companyProfileFormPayload,
    emptyCompanyProfileForm,
    type CompanyProfileFormState,
} from './companyProfileForm';
import { mapCompanyProfileApiErrors } from './mapCompanyProfileApiErrors';
import {
    validateCompanyProfileForm,
    type CompanyProfileFieldErrors,
} from './validateCompanyProfileForm';

export default function CompaniesEdit() {
    const [form, setForm] = useState<CompanyProfileFormState>(
        emptyCompanyProfileForm,
    );
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<CompanyProfileFieldErrors>(
        {},
    );

    useEffect(() => {
        void companyApiPost<ApiEnvelope<CompanySellerProfile>>(
            '/company/company-show',
            {},
        )
            .then((res) => {
                if (res.success && res.data) {
                    setForm(companyProfileFormFromApi(res.data));
                } else {
                    setFormError(
                        res.message ?? 'Could not load company profile.',
                    );
                }
            })
            .finally(() => setLoading(false));
    }, []);

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

        try {
            const res = await companyApiPost<ApiEnvelope<CompanySellerProfile>>(
                '/company/company-profile-update',
                companyProfileFormPayload(form),
            );

            if (!res.success) {
                const apiErrors = mapCompanyProfileApiErrors(
                    res.data as unknown as Record<string, unknown> | null,
                );
                if (Object.keys(apiErrors).length > 0) {
                    setFieldErrors(apiErrors);
                } else {
                    setFormError(res.message ?? 'Could not save profile.');
                }

                return;
            }

            router.visit(route('companies.index'));
        } catch {
            setFormError('Could not save profile.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Edit company profile
                </h2>
            }
        >
            <Head title="Edit company profile" />

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
                                Seller profile
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Details shown as the seller on your invoices.
                            </p>
                        </div>

                        {loading ? (
                            <p className="text-muted-foreground px-5 py-8 text-sm sm:px-6">
                                Loading…
                            </p>
                        ) : (
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
                                            ? 'Saving…'
                                            : 'Save profile'}
                                    </button>
                                    <Link
                                        href={route('companies.index')}
                                        className="text-muted-foreground text-center text-sm font-medium hover:text-foreground sm:text-left"
                                    >
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
