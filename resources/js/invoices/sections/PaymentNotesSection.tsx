import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import Accordion from './Accordion';
import type { InvoiceCompanyContext } from '../companyContext';
import {
    isPaymentBankVisible,
    isPaymentQrVisible,
    isPaymentTermsVisible,
    PAYMENT_VISIBILITY_BANK,
    PAYMENT_VISIBILITY_QR,
    PAYMENT_VISIBILITY_TERMS,
    paymentFromDraft,
    type CompanyPaymentSettings,
} from '../paymentTypes';
import type { InvoiceDraft } from '../types';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
    draft: InvoiceDraft;
    companyContext: InvoiceCompanyContext;
    onCompanyContextChange: (context: InvoiceCompanyContext) => void;
};

function PaymentField({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <InputLabel value={label} />
            <TextInput
                className="mt-1 block w-full"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

function paymentVisibilityFromSettings(
    settings: CompanyPaymentSettings,
): Record<string, boolean> {
    return {
        [PAYMENT_VISIBILITY_BANK]: Boolean(
            settings.default_show_bank_details_on_invoice ?? true,
        ),
        [PAYMENT_VISIBILITY_QR]: Boolean(
            settings.default_show_qr_on_invoice ?? true,
        ),
        [PAYMENT_VISIBILITY_TERMS]: Boolean(
            settings.default_show_payment_terms_on_invoice ?? true,
        ),
    };
}

export default function PaymentNotesSection({
    draft,
    companyContext,
    onCompanyContextChange,
}: Props) {
    const visibility = draft.field_visibility;
    const payment = paymentFromDraft(draft);
    const showBank = isPaymentBankVisible(visibility);
    const showQr = isPaymentQrVisible(visibility);
    const showPaymentTerms = isPaymentTermsVisible(visibility);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const paymentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const settings = companyContext.payment_settings ?? {};

    const applyPaymentContext = useCallback(
        (patch: Partial<CompanyPaymentSettings>) => {
            const nextSettings = { ...settings, ...patch };
            onCompanyContextChange({
                ...companyContext,
                payment_settings: nextSettings,
                payment_defaults: {
                    account_number: nextSettings.account_number ?? '',
                    account_type: nextSettings.account_type ?? '',
                    account_holder: nextSettings.account_holder ?? '',
                    upi_id: nextSettings.upi_id ?? '',
                    branch_ifsc: nextSettings.branch_ifsc ?? '',
                    branch_name: nextSettings.branch_name ?? '',
                    note: nextSettings.payment_note ?? '',
                },
                payment_field_visibility:
                    paymentVisibilityFromSettings(nextSettings),
            });
        },
        [companyContext, onCompanyContextChange, settings],
    );

    const persistPaymentSettings = useCallback(
        async (nextSettings: CompanyPaymentSettings) => {
            setSaving(true);
            setError(null);
            try {
                const res = await companyApiPost<
                    ApiEnvelope<CompanyPaymentSettings>
                >('/company/company-payment-settings-update', {
                    account_number: nextSettings.account_number ?? '',
                    account_holder: nextSettings.account_holder ?? '',
                    account_type: nextSettings.account_type ?? '',
                    upi_id: nextSettings.upi_id ?? '',
                    branch_ifsc: nextSettings.branch_ifsc ?? '',
                    branch_name: nextSettings.branch_name ?? '',
                    payment_note: nextSettings.payment_note ?? '',
                    default_payment_terms:
                        nextSettings.default_payment_terms ?? '',
                    default_show_bank_details_on_invoice:
                        nextSettings.default_show_bank_details_on_invoice ===
                        true,
                    default_show_qr_on_invoice:
                        nextSettings.default_show_qr_on_invoice === true,
                    default_show_payment_terms_on_invoice:
                        nextSettings.default_show_payment_terms_on_invoice ===
                        true,
                });

                if (!res.success || !res.data) {
                    setError(res.message ?? 'Could not save payment settings.');
                    return;
                }

                applyPaymentContext(res.data);
            } finally {
                setSaving(false);
            }
        },
        [applyPaymentContext],
    );

    const savePaymentSettings = useCallback(
        async (patch: Partial<CompanyPaymentSettings>) => {
            const nextSettings = { ...settings, ...patch };
            applyPaymentContext(patch);
            await persistPaymentSettings(nextSettings);
        },
        [applyPaymentContext, persistPaymentSettings, settings],
    );

    const queuePaymentSave = useCallback(
        (patch: Partial<CompanyPaymentSettings>) => {
            const nextSettings = { ...settings, ...patch };
            applyPaymentContext(patch);

            if (paymentTimer.current) {
                clearTimeout(paymentTimer.current);
            }
            paymentTimer.current = setTimeout(() => {
                void persistPaymentSettings(nextSettings);
            }, 600);
        },
        [applyPaymentContext, persistPaymentSettings, settings],
    );

    useEffect(
        () => () => {
            if (paymentTimer.current) {
                clearTimeout(paymentTimer.current);
            }
        },
        [],
    );

    return (
        <Accordion title="Payment & QR">
            <p className="text-muted-foreground text-xs leading-snug">
                Saved to company payment settings and applied to all invoices.
            </p>

            {error ? (
                <p className="text-destructive text-xs">{error}</p>
            ) : null}
            {saving ? (
                <p className="text-muted-foreground text-xs">Saving…</p>
            ) : null}

            <div className="space-y-2">
                <label className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground">
                    <input
                        type="checkbox"
                        className="rounded border-input text-sidebar-primary focus:ring-ring"
                        checked={showBank}
                        onChange={(e) =>
                            void savePaymentSettings({
                                default_show_bank_details_on_invoice:
                                    e.target.checked,
                            })
                        }
                    />
                    Bank details for payment
                </label>

                <label className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground">
                    <input
                        type="checkbox"
                        className="rounded border-input text-sidebar-primary focus:ring-ring"
                        checked={showQr}
                        onChange={(e) =>
                            void savePaymentSettings({
                                default_show_qr_on_invoice: e.target.checked,
                            })
                        }
                    />
                    Scan QR code to pay
                </label>

                <label className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground">
                    <input
                        type="checkbox"
                        className="rounded border-input text-sidebar-primary focus:ring-ring"
                        checked={showPaymentTerms}
                        onChange={(e) =>
                            void savePaymentSettings({
                                default_show_payment_terms_on_invoice:
                                    e.target.checked,
                            })
                        }
                    />
                    Payment terms
                </label>
            </div>

            {showBank ? (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">
                        Bank details
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <PaymentField
                            label="Account number"
                            value={payment.account_number ?? ''}
                            onChange={(value) =>
                                queuePaymentSave({ account_number: value })
                            }
                        />
                        <PaymentField
                            label="Account holder"
                            value={payment.account_holder ?? ''}
                            onChange={(value) =>
                                queuePaymentSave({ account_holder: value })
                            }
                        />
                        <PaymentField
                            label="Account type"
                            value={payment.account_type ?? ''}
                            onChange={(value) =>
                                queuePaymentSave({ account_type: value })
                            }
                            placeholder="e.g. Savings"
                        />
                        <PaymentField
                            label="UPI ID"
                            value={payment.upi_id ?? ''}
                            onChange={(value) =>
                                queuePaymentSave({ upi_id: value })
                            }
                            placeholder="name@upi"
                        />
                        <PaymentField
                            label="Branch IFSC"
                            value={payment.branch_ifsc ?? ''}
                            onChange={(value) =>
                                queuePaymentSave({ branch_ifsc: value })
                            }
                        />
                        <PaymentField
                            label="Branch name"
                            value={payment.branch_name ?? ''}
                            onChange={(value) =>
                                queuePaymentSave({ branch_name: value })
                            }
                        />
                    </div>
                    <div>
                        <InputLabel value="Payment note" />
                        <textarea
                            className="app-field mt-1 w-full"
                            rows={2}
                            value={payment.note ?? ''}
                            onChange={(e) =>
                                queuePaymentSave({ payment_note: e.target.value })
                            }
                            placeholder="Optional note shown with bank details"
                        />
                    </div>
                </div>
            ) : null}

            {showQr ? (
                <p className="text-muted-foreground text-[11px]">
                    QR is generated from the UPI ID above and this
                    invoice&apos;s total amount.
                </p>
            ) : null}

            {showPaymentTerms ? (
                <div>
                    <InputLabel value="Payment terms text" />
                    <textarea
                        className="app-field mt-1 w-full"
                        rows={2}
                        value={draft.document.payment_terms ?? ''}
                        onChange={(e) =>
                            queuePaymentSave({
                                default_payment_terms: e.target.value,
                            })
                        }
                        placeholder="Shown in the payment section on the invoice"
                    />
                </div>
            ) : null}
        </Accordion>
    );
}
