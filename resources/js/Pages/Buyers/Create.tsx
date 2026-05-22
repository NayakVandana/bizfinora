import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import BuyerFormFields from './BuyerFormFields';
import { emptyBuyerForm } from './buyerForm';
import { submitBuyerForm } from './submitBuyerForm';
import type { BuyerFieldErrors } from './validateBuyerForm';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function BuyersCreate() {
    const [form, setForm] = useState(emptyBuyerForm);
    const [errors, setErrors] = useState<BuyerFieldErrors>({});
    const [saving, setSaving] = useState(false);

    const save = async () => {
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
                    New buyer
                </h2>
            }
        >
            <Head title="New buyer" />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <Link
                        href={route('buyers.index')}
                        className="font-medium text-sidebar-primary hover:opacity-80 inline-flex items-center gap-1 text-sm"
                    >
                        ← Back to buyers
                    </Link>

                    <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm mt-6">
                        <div className="border-b border-border px-5 py-4 sm:px-6">
                            <h3 className="text-foreground font-semibold">
                                Buyer details
                            </h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Used as the buyer on your invoices.
                            </p>
                        </div>

                        <div className="space-y-5 px-5 py-6 sm:px-6">
                            <BuyerFormFields
                                form={form}
                                errors={errors}
                                onChange={(patch) => {
                                    setForm((prev) => ({ ...prev, ...patch }));
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
                                    {saving ? 'Saving…' : 'Create'}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
