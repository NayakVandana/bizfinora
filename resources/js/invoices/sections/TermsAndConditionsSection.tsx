import InputLabel from '@/Components/InputLabel';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import Accordion from './Accordion';
import type { InvoiceCompanyContext } from '../companyContext';
import {
    isTermsAndConditionsVisible,
    TERMS_VISIBILITY,
    type CompanyTermsSettings,
} from '../termsSettings';
import type { InvoiceDraft } from '../types';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
    draft: InvoiceDraft;
    companyContext: InvoiceCompanyContext;
    onCompanyContextChange: (context: InvoiceCompanyContext) => void;
};

export default function TermsAndConditionsSection({
    draft,
    companyContext,
    onCompanyContextChange,
}: Props) {
    const showTerms = isTermsAndConditionsVisible(draft.field_visibility);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const termsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const termsSettings = companyContext.terms_settings ?? {};

    const applyTermsContext = useCallback(
        (patch: Partial<CompanyTermsSettings>) => {
            const nextSettings = { ...termsSettings, ...patch };
            onCompanyContextChange({
                ...companyContext,
                terms_settings: nextSettings,
                terms_field_visibility: {
                    [TERMS_VISIBILITY]: Boolean(
                        nextSettings.default_show_terms_on_invoice ?? true,
                    ),
                },
            });
        },
        [companyContext, onCompanyContextChange, termsSettings],
    );

    const persistTermsSettings = useCallback(
        async (nextSettings: CompanyTermsSettings) => {
            setSaving(true);
            setError(null);
            try {
                const res = await companyApiPost<
                    ApiEnvelope<CompanyTermsSettings>
                >('/company/company-terms-settings-update', {
                    default_terms_and_conditions:
                        nextSettings.default_terms_and_conditions ?? '',
                    default_show_terms_on_invoice:
                        nextSettings.default_show_terms_on_invoice === true,
                });

                if (!res.success || !res.data) {
                    setError(res.message ?? 'Could not save terms settings.');
                    return;
                }

                applyTermsContext(res.data);
            } finally {
                setSaving(false);
            }
        },
        [applyTermsContext],
    );

    const saveTermsSettings = useCallback(
        async (patch: Partial<CompanyTermsSettings>) => {
            const nextSettings = { ...termsSettings, ...patch };
            applyTermsContext(patch);
            await persistTermsSettings(nextSettings);
        },
        [applyTermsContext, persistTermsSettings, termsSettings],
    );

    const queueTermsSave = useCallback(
        (patch: Partial<CompanyTermsSettings>) => {
            applyTermsContext(patch);

            if (termsTimer.current) {
                clearTimeout(termsTimer.current);
            }
            termsTimer.current = setTimeout(() => {
                void persistTermsSettings({ ...termsSettings, ...patch });
            }, 600);
        },
        [applyTermsContext, persistTermsSettings, termsSettings],
    );

    useEffect(
        () => () => {
            if (termsTimer.current) {
                clearTimeout(termsTimer.current);
            }
        },
        [],
    );

    return (
        <Accordion title="Terms and conditions">
            <p className="text-muted-foreground text-xs leading-snug">
                Saved to company terms settings and shown in the invoice footer
                on all invoices.
            </p>

            {error ? (
                <p className="text-destructive text-xs">{error}</p>
            ) : null}
            {saving ? (
                <p className="text-muted-foreground text-xs">Saving…</p>
            ) : null}

            <label className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2.5 text-sm font-medium text-foreground">
                <input
                    type="checkbox"
                    className="rounded border-input text-sidebar-primary focus:ring-ring"
                    checked={showTerms}
                    onChange={(e) =>
                        void saveTermsSettings({
                            default_show_terms_on_invoice: e.target.checked,
                        })
                    }
                />
                Show terms and conditions on invoice
            </label>

            {showTerms ? (
                <div>
                    <InputLabel value="Terms and conditions text" />
                    <textarea
                        className="app-field mt-1 w-full"
                        rows={5}
                        value={draft.document.notes ?? ''}
                        onChange={(e) =>
                            queueTermsSave({
                                default_terms_and_conditions: e.target.value,
                            })
                        }
                        placeholder="Legal or general terms shown in the invoice footer"
                    />
                </div>
            ) : null}
        </Accordion>
    );
}
