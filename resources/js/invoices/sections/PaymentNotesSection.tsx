import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import Accordion from './Accordion';
import PartyFieldRow from './PartyFieldRow';
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
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
    draft: InvoiceDraft;
    companyContext: InvoiceCompanyContext;
    onCompanyContextChange: (context: InvoiceCompanyContext) => void;
};

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
    const paymentTermsTimer = useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

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

    const savePaymentSettings = useCallback(
        async (patch: Partial<CompanyPaymentSettings>) => {
            const nextSettings = { ...settings, ...patch };
            applyPaymentContext(patch);
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
        [applyPaymentContext, settings],
    );

    const queuePaymentTermsSave = useCallback(
        (value: string) => {
            applyPaymentContext({ default_payment_terms: value });

            if (paymentTermsTimer.current) {
                clearTimeout(paymentTermsTimer.current);
            }
            paymentTermsTimer.current = setTimeout(() => {
                void savePaymentSettings({
                    ...settings,
                    default_payment_terms: value,
                });
            }, 600);
        },
        [applyPaymentContext, savePaymentSettings, settings],
    );

    useEffect(
        () => () => {
            if (paymentTermsTimer.current) {
                clearTimeout(paymentTermsTimer.current);
            }
        },
        [],
    );

    return (
        <Accordion title="Payment & QR">
            <p className="text-muted-foreground text-xs leading-snug">
                Bank details come from{' '}
                <Link
                    href={route('settings.payment')}
                    className="font-medium text-sidebar-primary hover:opacity-80"
                >
                    payment settings
                </Link>
                . Toggle what appears on this invoice PDF below.
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
                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-sm font-medium text-foreground">
                        Bank details
                    </p>
                    <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted">
                        <PartyFieldRow
                            label="Account number"
                            value={payment.account_number}
                            visibility={visibility ?? {}}
                            onVisibilityChange={() => {}}
                            showToggle={false}
                        />
                        <PartyFieldRow
                            label="Account holder"
                            value={payment.account_holder}
                            visibility={visibility ?? {}}
                            onVisibilityChange={() => {}}
                            showToggle={false}
                        />
                        <PartyFieldRow
                            label="Account type"
                            value={payment.account_type}
                            visibility={visibility ?? {}}
                            onVisibilityChange={() => {}}
                            showToggle={false}
                        />
                        <PartyFieldRow
                            label="UPI ID"
                            value={payment.upi_id}
                            visibility={visibility ?? {}}
                            onVisibilityChange={() => {}}
                            showToggle={false}
                        />
                        <PartyFieldRow
                            label="Branch IFSC"
                            value={payment.branch_ifsc}
                            visibility={visibility ?? {}}
                            onVisibilityChange={() => {}}
                            showToggle={false}
                        />
                        <PartyFieldRow
                            label="Branch name"
                            value={payment.branch_name}
                            visibility={visibility ?? {}}
                            onVisibilityChange={() => {}}
                            showToggle={false}
                        />
                        {showPaymentTerms ? (
                            <PartyFieldRow
                                label="Payment note"
                                value={payment.note}
                                visibility={visibility ?? {}}
                                onVisibilityChange={() => {}}
                                showToggle={false}
                            />
                        ) : null}
                    </div>
                </div>
            ) : null}

            {showQr ? (
                <p className="text-muted-foreground text-[11px]">
                    QR is generated from the UPI ID in payment settings and this
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
                            queuePaymentTermsSave(e.target.value)
                        }
                        placeholder="Shown in the payment section on the invoice"
                    />
                </div>
            ) : null}
        </Accordion>
    );
}
