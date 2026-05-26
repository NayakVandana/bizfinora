import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import Accordion from './Accordion';
import type { InvoiceCompanyContext } from '../companyContext';
import {
    isAuthorizedSignatureVisible,
    SIGNATURE_VISIBILITY,
    type CompanySignatureSettings,
} from '../signatureSettings';
import type { InvoiceDraft } from '../types';
import { Link } from '@inertiajs/react';
import { useCallback, useState } from 'react';

type Props = {
    draft: InvoiceDraft;
    companyContext: InvoiceCompanyContext;
    onCompanyContextChange: (context: InvoiceCompanyContext) => void;
};

export default function AuthorizedSignatureSection({
    draft,
    companyContext,
    onCompanyContextChange,
}: Props) {
    const showSignature = isAuthorizedSignatureVisible(draft.field_visibility);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const signatureSettings = companyContext.signature_settings ?? {};

    const applySignatureContext = useCallback(
        (patch: Partial<CompanySignatureSettings>) => {
            const nextSettings = { ...signatureSettings, ...patch };
            onCompanyContextChange({
                ...companyContext,
                signature_settings: nextSettings,
                signature_field_visibility: {
                    [SIGNATURE_VISIBILITY]: Boolean(
                        nextSettings.default_show_authorized_signature_on_invoice ??
                            true,
                    ),
                },
            });
        },
        [companyContext, onCompanyContextChange, signatureSettings],
    );

    const saveVisibility = useCallback(
        async (show: boolean) => {
            applySignatureContext({
                default_show_authorized_signature_on_invoice: show,
            });
            setSaving(true);
            setError(null);
            try {
                const res = await companyApiPost<
                    ApiEnvelope<CompanySignatureSettings>
                >('/company/company-signature-settings-update', {
                    default_show_authorized_signature_on_invoice: show,
                });

                if (!res.success || !res.data) {
                    setError(
                        res.message ??
                            'Could not save authorised signature settings.',
                    );
                    return;
                }

                applySignatureContext(res.data);
            } finally {
                setSaving(false);
            }
        },
        [applySignatureContext],
    );

    const companyName = draft.document.seller.name?.trim() ?? '';

    return (
        <Accordion title="Authorised signature">
            <p className="text-muted-foreground text-xs leading-snug">
                Default from{' '}
                <Link
                    href={route('settings.signature')}
                    className="font-medium text-sidebar-primary hover:opacity-80"
                >
                    Signature settings
                </Link>
                . Shows a signature line with &quot;Authorised Signature&quot;
                and your company name on the invoice.
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
                    checked={showSignature}
                    onChange={(e) => void saveVisibility(e.target.checked)}
                />
                Show authorised signature on invoice
            </label>

            {showSignature && companyName ? (
                <p className="text-muted-foreground text-xs">
                    PDF will show:{' '}
                    <span className="font-medium text-foreground">
                        Authorised Signature
                    </span>
                    <br />
                    <span className="font-medium text-foreground">
                        For {companyName.toUpperCase()}
                    </span>
                </p>
            ) : null}
        </Accordion>
    );
}
