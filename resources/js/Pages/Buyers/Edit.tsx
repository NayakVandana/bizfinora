import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { BuyerOption } from '@/Pages/Invoices/types';
import BuyerFormFields from './BuyerFormFields';
import { buyerToForm } from './buyerForm';
import { submitBuyerForm } from './submitBuyerForm';
import type { BuyerFieldErrors } from './validateBuyerForm';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type Props = {
    buyerId: number;
};

export default function BuyersEdit({ buyerId }: Props) {
    const [form, setForm] = useState<ReturnType<typeof buyerToForm> | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<BuyerFieldErrors>({});
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        void companyApiPost<ApiEnvelope<BuyerOption[]>>(
            '/buyers/buyers-list',
            {},
        ).then((res) => {
            if (res.success && res.data) {
                const buyer = res.data.find((b) => b.id === buyerId);
                if (buyer) {
                    setForm(buyerToForm(buyer));
                } else {
                    setNotFound(true);
                }
            } else {
                setNotFound(true);
            }
            setLoading(false);
        });
    }, [buyerId]);

    const save = async () => {
        if (!form?.id) {
            return;
        }
        setSaving(true);
        try {
            const result = await submitBuyerForm(form);
            if (result.ok) {
                router.visit(route('buyers.index'));
            } else {
                setErrors(result.errors);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Edit buyer
                </h2>
            }
        >
            <Head title="Edit buyer" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('buyers.index')}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to buyers
                    </Link>

                    {loading ? (
                        <p className="mt-6 text-center text-gray-500">
                            Loading…
                        </p>
                    ) : notFound || !form ? (
                        <p className="mt-6 text-center text-gray-600">
                            Buyer not found.
                        </p>
                    ) : (
                        <div className="mt-4 rounded-lg bg-white p-6 shadow-sm">
                            <BuyerFormFields
                                form={form}
                                errors={errors}
                                onChange={(patch) => {
                                    setForm((prev) =>
                                        prev ? { ...prev, ...patch } : prev,
                                    );
                                    const key = Object.keys(patch)[0] as keyof typeof patch;
                                    if (key && errors[key]) {
                                        setErrors((prev) => {
                                            const next = { ...prev };
                                            delete next[key];
                                            return next;
                                        });
                                    }
                                }}
                            />
                            <InputError message={errors._form} className="mt-4" />
                            <div className="mt-6">
                                <PrimaryButton
                                    type="button"
                                    disabled={saving}
                                    onClick={() => void save()}
                                >
                                    {saving ? 'Saving…' : 'Update'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
