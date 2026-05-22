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
        void companyApiPost<ApiEnvelope<BuyerOption>>('/buyers/buyer-show', {
            id: buyerId,
        }).then((res) => {
            if (res.success && res.data) {
                setForm(buyerToForm(res.data));
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
                <h2 className="text-foreground text-xl font-semibold">
                    Edit buyer
                </h2>
            }
        >
            <Head title="Edit buyer" />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Link
                            href={route('buyers.index')}
                            className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1"
                        >
                            ← Back to buyers
                        </Link>
                        {!loading && !notFound && form ? (
                            <Link
                                href={route('buyers.show', buyerId)}
                                className="font-medium text-sidebar-primary hover:opacity-80"
                            >
                                View details
                            </Link>
                        ) : null}
                    </div>

                    {loading ? (
                        <p className="text-muted-foreground mt-6 text-center text-sm">
                            Loading…
                        </p>
                    ) : notFound || !form ? (
                        <p className="text-muted-foreground mt-6 text-center text-sm">
                            Buyer not found.
                        </p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm mt-6">
                            <div className="border-b border-border px-5 py-4 sm:px-6">
                                <h3 className="text-foreground font-semibold">
                                    Buyer details
                                </h3>
                            </div>

                            <div className="space-y-5 px-5 py-6 sm:px-6">
                                <BuyerFormFields
                                    form={form}
                                    errors={errors}
                                    onChange={(patch) => {
                                        setForm((prev) =>
                                            prev ? { ...prev, ...patch } : prev,
                                        );
                                        const key = Object.keys(
                                            patch,
                                        )[0] as keyof typeof patch;
                                        if (key && errors[key]) {
                                            setErrors((prev) => {
                                                const next = { ...prev };
                                                delete next[key];
                                                return next;
                                            });
                                        }
                                    }}
                                />
                                <InputError message={errors._form} />
                                <div className="border-t border-border pt-5">
                                    <PrimaryButton
                                        type="button"
                                        disabled={saving}
                                        onClick={() => void save()}
                                    >
                                        {saving ? 'Saving…' : 'Update'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
