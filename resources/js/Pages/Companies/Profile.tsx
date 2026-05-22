import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { CompanySellerProfile } from '@/invoices/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
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

export default function CompanyProfile() {
    const [form, setForm] = useState<CompanyProfileFormState>(
        emptyCompanyProfileForm,
    );
    const [loading, setLoading] = useState(true);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<CompanyProfileFieldErrors>(
        {},
    );

    useEffect(() => {
        void companyApiPost<ApiEnvelope<CompanySellerProfile>>(
            '/company/company-show',
            {},
        ).then((res) => {
            if (res.success && res.data) {
                setForm(companyProfileFormFromApi(res.data));
                setLoaded(true);
            } else {
                setError(res.message ?? 'Could not load company profile.');
            }
            setLoading(false);
        });
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

    const save = async () => {
        const clientErrors = validateCompanyProfileForm(form);
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            setError('Please fix the highlighted fields.');
            return;
        }

        setSaving(true);
        setMessage(null);
        setError(null);
        setFieldErrors({});

        try {
            const res = await companyApiPost<ApiEnvelope<CompanySellerProfile>>(
                '/company/company-profile-update',
                companyProfileFormPayload(form),
            );

            if (res.success && res.data) {
                setForm(companyProfileFormFromApi(res.data));
                setMessage('Company profile saved.');
            } else {
                const apiErrors = mapCompanyProfileApiErrors(
                    res.data as unknown as Record<string, unknown> | null,
                );
                if (Object.keys(apiErrors).length > 0) {
                    setFieldErrors(apiErrors);
                } else {
                    setError(res.message ?? 'Save failed.');
                }
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Company profile
                </h2>
            }
        >
            <Head title="Company profile" />

            <div className="py-6">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    <p className="mb-4 text-sm text-gray-600">
                        This information appears as the seller on your invoices.
                        On the invoice builder you can choose which fields to
                        show on the PDF.
                    </p>

                    <Link
                        href={route('companies.index')}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to companies
                    </Link>

                    {loading ? (
                        <p className="mt-6 text-gray-500">Loading…</p>
                    ) : !loaded ? (
                        <p className="mt-6 text-red-600">
                            {error ?? 'Could not load company profile.'}
                        </p>
                    ) : (
                        <div className="mt-6 space-y-6 rounded-lg bg-white p-6 shadow-sm">
                            {message ? (
                                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                    {message}
                                </div>
                            ) : null}
                            {error ? <InputError message={error} /> : null}

                            <form
                                noValidate
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    void save();
                                }}
                            >
                                <CompanyProfileFormFields
                                    form={form}
                                    errors={fieldErrors}
                                    onChange={update}
                                    onClearError={clearFieldError}
                                />

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <PrimaryButton
                                        type="submit"
                                        disabled={saving}
                                    >
                                        {saving ? 'Saving…' : 'Save profile'}
                                    </PrimaryButton>
                                    <Link href={route('invoices.create')}>
                                        <SecondaryButton type="button">
                                            Create invoice
                                        </SecondaryButton>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
