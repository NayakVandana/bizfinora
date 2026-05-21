import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { BuyerOption } from '@/Pages/Invoices/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const emptyForm = (): Omit<BuyerOption, 'id'> & { id?: number } => ({
    name: '',
    email: '',
    phone: '',
    tax_id: '',
    tax_id_label: 'VAT no',
    address: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    account_number: '',
    swift_bic: '',
    notes: '',
});

export default function BuyersIndex() {
    const [buyers, setBuyers] = useState<BuyerOption[]>([]);
    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);

    const load = async () => {
        const res = await companyApiPost<ApiEnvelope<BuyerOption[]>>(
            '/buyers/buyers-list',
            {},
        );
        if (res.success && res.data) {
            setBuyers(res.data);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const edit = (buyer: BuyerOption) => setForm({ ...buyer });

    const reset = () => setForm(emptyForm());

    const save = async () => {
        setSaving(true);
        try {
            const path = form.id
                ? '/buyers/buyer-update'
                : '/buyers/buyer-store';
            const res = await companyApiPost<ApiEnvelope<BuyerOption>>(path, {
                ...form,
                id: form.id,
            });
            if (res.success) {
                await load();
                reset();
            }
        } finally {
            setSaving(false);
        }
    };

    const destroy = async (id: number) => {
        if (!confirm('Delete this buyer?')) {
            return;
        }
        const res = await companyApiPost<ApiEnvelope<null>>(
            '/buyers/buyer-destroy',
            { id },
        );
        if (res.success) {
            await load();
            if (form.id === id) {
                reset();
            }
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">Buyers</h2>
            }
        >
            <Head title="Buyers" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-lg bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900">
                            {form.id ? 'Edit buyer' : 'New buyer'}
                        </h3>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                                <InputLabel value="Name *" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel value="Email" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.email ?? ''}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel value="Phone" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.phone ?? ''}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel value="Tax ID" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.tax_id ?? ''}
                                    onChange={(e) =>
                                        setForm({ ...form, tax_id: e.target.value })
                                    }
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <InputLabel value="Address (multi-line)" />
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    rows={3}
                                    value={form.address ?? ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            address: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel value="City" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.city ?? ''}
                                    onChange={(e) =>
                                        setForm({ ...form, city: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel value="Country" />
                                <TextInput
                                    className="mt-1 block w-full"
                                    value={form.country ?? ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            country: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <InputLabel value="Notes" />
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    rows={2}
                                    value={form.notes ?? ''}
                                    onChange={(e) =>
                                        setForm({ ...form, notes: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <PrimaryButton
                                type="button"
                                disabled={saving || !form.name.trim()}
                                onClick={() => void save()}
                            >
                                {saving ? 'Saving…' : form.id ? 'Update' : 'Create'}
                            </PrimaryButton>
                            {form.id ? (
                                <SecondaryButton type="button" onClick={reset}>
                                    Cancel
                                </SecondaryButton>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-lg bg-white shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {buyers.map((b) => (
                                    <tr key={b.id}>
                                        <td className="px-4 py-3">{b.name}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {b.email ?? '—'}
                                        </td>
                                        <td className="space-x-2 px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                className="text-indigo-600"
                                                onClick={() => edit(b)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="text-red-600"
                                                onClick={() => void destroy(b.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {buyers.length === 0 ? (
                            <p className="p-6 text-center text-gray-500">
                                No buyers yet.
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
