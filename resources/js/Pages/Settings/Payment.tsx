import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import {
    PAYMENT_TERMS_PRESETS,
    paymentTermsForType,
} from '@/invoices/paymentTermsPresets';
import type { CompanyPaymentSettings } from '@/invoices/paymentTypes';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const emptyForm: CompanyPaymentSettings = {
    account_number: '',
    account_holder: '',
    account_type: '',
    upi_id: '',
    branch_ifsc: '',
    branch_name: '',
    payment_note: '',
    default_show_bank_details_on_invoice: true,
    default_show_qr_on_invoice: true,
    default_show_payment_terms_on_invoice: true,
    default_payment_terms: '',
};

export default function PaymentSettings() {
    const [form, setForm] = useState<CompanyPaymentSettings>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [defaultInvoiceType, setDefaultInvoiceType] = useState('standard');

    useEffect(() => {
        Promise.all([
            companyApiPost<ApiEnvelope<CompanyPaymentSettings>>(
                '/company/company-show',
                {},
            ),
            companyApiPost<
                ApiEnvelope<{ default_invoice_type?: string }>
            >('/invoices/invoice-meta', {}),
        ]).then(([res, metaRes]) => {
            if (metaRes.success && metaRes.data?.default_invoice_type) {
                setDefaultInvoiceType(metaRes.data.default_invoice_type);
            }
            if (res.success && res.data) {
                setForm({
                    account_number: res.data.account_number ?? '',
                    account_holder: res.data.account_holder ?? '',
                    account_type: res.data.account_type ?? '',
                    upi_id: res.data.upi_id ?? '',
                    branch_ifsc: res.data.branch_ifsc ?? '',
                    branch_name: res.data.branch_name ?? '',
                    payment_note: res.data.payment_note ?? '',
                    default_show_bank_details_on_invoice: Boolean(
                        res.data.default_show_bank_details_on_invoice ??
                            res.data.default_show_payment_on_invoice ??
                            true,
                    ),
                    default_show_qr_on_invoice: Boolean(
                        res.data.default_show_qr_on_invoice ??
                            res.data.default_show_payment_on_invoice ??
                            true,
                    ),
                    default_show_payment_terms_on_invoice: Boolean(
                        res.data.default_show_payment_terms_on_invoice ??
                            res.data.default_show_payment_on_invoice ??
                            true,
                    ),
                    default_payment_terms: res.data.default_payment_terms ?? '',
                });
            }
            setLoading(false);
        });
    }, []);

    const applyTypeDefaultTerms = () => {
        setForm({
            ...form,
            default_payment_terms: paymentTermsForType(defaultInvoiceType),
        });
    };

    const clearDefaultTerms = () => {
        setForm({ ...form, default_payment_terms: '' });
    };

    const save = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await companyApiPost<ApiEnvelope<CompanyPaymentSettings>>(
                '/company/company-payment-settings-update',
                {
                    account_number: form.account_number ?? '',
                    account_holder: form.account_holder ?? '',
                    account_type: form.account_type ?? '',
                    upi_id: form.upi_id ?? '',
                    branch_ifsc: form.branch_ifsc ?? '',
                    branch_name: form.branch_name ?? '',
                    payment_note: form.payment_note ?? '',
                    default_payment_terms: form.default_payment_terms ?? '',
                    default_show_bank_details_on_invoice:
                        form.default_show_bank_details_on_invoice === true,
                    default_show_qr_on_invoice:
                        form.default_show_qr_on_invoice === true,
                    default_show_payment_terms_on_invoice:
                        form.default_show_payment_terms_on_invoice === true,
                },
            );
            if (res.success && res.data) {
                setForm({
                    account_number: res.data.account_number ?? '',
                    account_holder: res.data.account_holder ?? '',
                    account_type: res.data.account_type ?? '',
                    upi_id: res.data.upi_id ?? '',
                    branch_ifsc: res.data.branch_ifsc ?? '',
                    branch_name: res.data.branch_name ?? '',
                    payment_note: res.data.payment_note ?? '',
                    default_show_bank_details_on_invoice: Boolean(
                        res.data.default_show_bank_details_on_invoice,
                    ),
                    default_show_qr_on_invoice: Boolean(
                        res.data.default_show_qr_on_invoice,
                    ),
                    default_show_payment_terms_on_invoice: Boolean(
                        res.data.default_show_payment_terms_on_invoice,
                    ),
                    default_payment_terms: res.data.default_payment_terms ?? '',
                });
            }
            setMessage(
                res.success
                    ? 'Payment settings saved for your active company.'
                    : (res.message ?? 'Save failed.'),
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Payment settings
                </h2>
            }
        >
            <Head title="Payment settings" />

            <div className="py-6 sm:py-8">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-muted-foreground text-sm">Loading…</p>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
                            <div className="border-b border-border px-5 py-4 sm:px-6">
                                <p className="text-muted-foreground text-sm">
                                    Bank details, UPI, and payment notes used on
                                    invoices. QR codes are generated from UPI ID
                                    and the invoice total. Set defaults for each
                                    section on new invoices.
                                </p>
                            </div>

                            <div className="space-y-6 px-5 py-6 sm:px-6">
                                {message ? (
                                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                                        {message}
                                    </div>
                                ) : null}

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            className="rounded border-input text-sidebar-primary focus:ring-ring"
                                            checked={Boolean(
                                                form.default_show_bank_details_on_invoice,
                                            )}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    default_show_bank_details_on_invoice:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Bank details for payment on new invoices
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            className="rounded border-input text-sidebar-primary focus:ring-ring"
                                            checked={Boolean(
                                                form.default_show_qr_on_invoice,
                                            )}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    default_show_qr_on_invoice:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Scan QR code to pay on new invoices
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            className="rounded border-input text-sidebar-primary focus:ring-ring"
                                            checked={Boolean(
                                                form.default_show_payment_terms_on_invoice,
                                            )}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    default_show_payment_terms_on_invoice:
                                                        e.target.checked,
                                                })
                                            }
                                        />
                                        Payment terms on new invoices
                                    </label>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <InputLabel value="Account number" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={form.account_number ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    account_number:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Account type" />
                                        <select
                                            className="app-field mt-1 w-full"
                                            value={form.account_type ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    account_type: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">—</option>
                                            <option value="Current">
                                                Current
                                            </option>
                                            <option value="Savings">
                                                Savings
                                            </option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <InputLabel value="Account holder" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={form.account_holder ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    account_holder:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="UPI ID" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={form.upi_id ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    upi_id: e.target.value,
                                                })
                                            }
                                            placeholder="name@bank"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel value="Branch IFSC" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={form.branch_ifsc ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    branch_ifsc:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <InputLabel value="Branch name" />
                                        <TextInput
                                            className="mt-1 block w-full"
                                            value={form.branch_name ?? ''}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    branch_name:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <p className="text-muted-foreground text-xs">
                                    A scannable UPI QR is created when an invoice
                                    shows the payment block and includes a UPI ID
                                    here.
                                </p>

                                <div>
                                    <InputLabel value="Default payment terms" />
                                    <p className="text-muted-foreground mt-1 text-xs">
                                        Shown in the payment section on new
                                        invoices. Leave empty to use terms for
                                        each invoice type automatically.
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {PAYMENT_TERMS_PRESETS.map((preset) => (
                                            <button
                                                key={preset.id}
                                                type="button"
                                                className={
                                                    form.default_payment_terms ===
                                                    preset.text
                                                        ? 'rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground'
                                                        : 'rounded-full border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted'
                                                }
                                                onClick={() =>
                                                    setForm({
                                                        ...form,
                                                        default_payment_terms:
                                                            preset.text,
                                                    })
                                                }
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-sidebar-primary hover:opacity-80"
                                            onClick={applyTypeDefaultTerms}
                                        >
                                            Use terms for{' '}
                                            {defaultInvoiceType.replace(
                                                /_/g,
                                                ' ',
                                            )}{' '}
                                            invoices
                                        </button>
                                        <button
                                            type="button"
                                            className="text-xs text-muted-foreground hover:text-foreground"
                                            onClick={clearDefaultTerms}
                                        >
                                            Clear (use per-type defaults)
                                        </button>
                                    </div>
                                    <textarea
                                        className="app-field mt-2 w-full"
                                        rows={2}
                                        value={form.default_payment_terms ?? ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                default_payment_terms:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder={paymentTermsForType(
                                            defaultInvoiceType,
                                        )}
                                    />
                                </div>

                                <div>
                                    <InputLabel value="Payment note (on invoice)" />
                                    <textarea
                                        className="app-field mt-1 w-full"
                                        rows={2}
                                        value={form.payment_note ?? ''}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                payment_note: e.target.value,
                                            })
                                        }
                                        placeholder="Make payment and share transaction details. Plan activated after confirmation."
                                    />
                                </div>

                                <PrimaryButton
                                    disabled={saving}
                                    onClick={() => void save()}
                                >
                                    {saving ? 'Saving…' : 'Save payment settings'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
