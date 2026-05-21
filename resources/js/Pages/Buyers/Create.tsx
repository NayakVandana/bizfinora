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
        setErrors({});
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
                    New buyer
                </h2>
            }
        >
            <Head title="New buyer" />

            <div className="py-6">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={route('buyers.index')}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        ← Back to buyers
                    </Link>

                    <div className="mt-4 rounded-lg bg-white p-6 shadow-sm">
                        <BuyerFormFields
                            form={form}
                            errors={errors}
                            onChange={(patch) => {
                                setForm((prev) => ({ ...prev, ...patch }));
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
                                disabled={saving || !form.name.trim()}
                                onClick={() => void save()}
                            >
                                {saving ? 'Saving…' : 'Create'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
