import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { CompanySellerProfile } from '@/invoices/types';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CompanyProfile() {
    const [profile, setProfile] = useState<CompanySellerProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        void companyApiPost<ApiEnvelope<CompanySellerProfile>>(
            '/company/company-show',
            {},
        ).then((res) => {
            if (res.success && res.data) {
                setProfile({
                    id: res.data.id,
                    name: res.data.name ?? '',
                    address: res.data.address ?? '',
                    tax_id: res.data.tax_id ?? '',
                    tax_id_label: res.data.tax_id_label ?? 'GSTIN',
                    email: res.data.email ?? '',
                    phone: res.data.phone ?? '',
                    account_number: res.data.account_number ?? '',
                    swift_bic: res.data.swift_bic ?? '',
                    logo_data_url: res.data.logo_data_url ?? null,
                    seller_notes: res.data.seller_notes ?? '',
                });
            } else {
                setError(res.message ?? 'Could not load company profile.');
            }
            setLoading(false);
        });
    }, []);

    const update = (patch: Partial<CompanySellerProfile>) => {
        setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    const onLogoFile = (file: File | null) => {
        if (!file) {
            update({ logo_data_url: null });
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            update({ logo_data_url: reader.result as string });
        reader.readAsDataURL(file);
    };

    const save = async () => {
        if (!profile?.name.trim()) {
            setError('Company name is required.');
            return;
        }

        setSaving(true);
        setMessage(null);
        setError(null);

        try {
            const res = await companyApiPost<ApiEnvelope<CompanySellerProfile>>(
                '/company/company-profile-update',
                {
                    name: profile.name.trim(),
                    address: profile.address ?? '',
                    tax_id: profile.tax_id ?? '',
                    tax_id_label: profile.tax_id_label ?? 'GSTIN',
                    email: profile.email ?? '',
                    phone: profile.phone ?? '',
                    account_number: profile.account_number ?? '',
                    swift_bic: profile.swift_bic ?? '',
                    logo_data_url: profile.logo_data_url,
                    seller_notes: profile.seller_notes ?? '',
                },
            );

            if (res.success && res.data) {
                setProfile({
                    id: res.data.id,
                    name: res.data.name ?? profile.name,
                    address: res.data.address ?? '',
                    tax_id: res.data.tax_id ?? '',
                    tax_id_label: res.data.tax_id_label ?? 'GSTIN',
                    email: res.data.email ?? '',
                    phone: res.data.phone ?? '',
                    account_number: res.data.account_number ?? '',
                    swift_bic: res.data.swift_bic ?? '',
                    logo_data_url: res.data.logo_data_url ?? null,
                    seller_notes: res.data.seller_notes ?? '',
                });
                setMessage('Company profile saved.');
            } else {
                setError(res.message ?? 'Save failed.');
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
                    ) : !profile ? (
                        <p className="mt-6 text-red-600">{error}</p>
                    ) : (
                        <div className="mt-6 space-y-6 rounded-lg bg-white p-6 shadow-sm">
                            {message ? (
                                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                    {message}
                                </div>
                            ) : null}
                            {error ? <InputError message={error} /> : null}

                            <div>
                                <InputLabel value="Company name" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={profile.name}
                                    onChange={(e) =>
                                        update({ name: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <InputLabel value="Address" />
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    rows={3}
                                    value={profile.address ?? ''}
                                    onChange={(e) =>
                                        update({ address: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel value="Tax ID label" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={profile.tax_id_label ?? 'GSTIN'}
                                        onChange={(e) =>
                                            update({
                                                tax_id_label: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Tax ID" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={profile.tax_id ?? ''}
                                        onChange={(e) =>
                                            update({ tax_id: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel value="Email" />
                                    <TextInput
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={profile.email ?? ''}
                                        onChange={(e) =>
                                            update({ email: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <InputLabel value="Phone" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={profile.phone ?? ''}
                                        onChange={(e) =>
                                            update({ phone: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel value="Bank account" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={profile.account_number ?? ''}
                                        onChange={(e) =>
                                            update({
                                                account_number: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <InputLabel value="SWIFT / BIC" />
                                    <TextInput
                                        className="mt-1 block w-full"
                                        value={profile.swift_bic ?? ''}
                                        onChange={(e) =>
                                            update({
                                                swift_bic: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Company notes" />
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    rows={2}
                                    value={profile.seller_notes ?? ''}
                                    onChange={(e) =>
                                        update({
                                            seller_notes: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <InputLabel value="Company logo" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="mt-1 block w-full text-sm"
                                    onChange={(e) =>
                                        onLogoFile(e.target.files?.[0] ?? null)
                                    }
                                />
                                {profile.logo_data_url ? (
                                    <img
                                        src={profile.logo_data_url}
                                        alt="Company logo"
                                        className="mt-2 h-16 object-contain"
                                    />
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <PrimaryButton
                                    disabled={saving}
                                    onClick={() => void save()}
                                >
                                    {saving ? 'Saving…' : 'Save profile'}
                                </PrimaryButton>
                                <Link href={route('invoices.create')}>
                                    <SecondaryButton type="button">
                                        Create invoice
                                    </SecondaryButton>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
