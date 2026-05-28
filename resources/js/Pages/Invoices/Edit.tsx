import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import InvoiceBuilder from '@/invoices/InvoiceBuilder';
import { invoicePayloadToDraft } from '@/invoices/defaultDraft';
import { submitInvoiceForm } from '@/invoices/submitInvoiceForm';
import {
    companyContextFromMeta,
    mergeCompanyContextIntoDraft,
    type InvoiceCompanyContext,
} from '@/invoices/companyContext';
import {
    scrollToFirstInvoiceError,
    syncLiveInvoiceErrors,
    type InvoiceFieldErrors,
} from '@/invoices/validateInvoiceForm';
import type { InvoiceDraft } from '@/invoices/types';
import { invoiceIsEditable } from '@/invoices/invoiceActions';
import type { BuyerOption } from '@/Pages/Invoices/types';
import { Head, router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type InvoicePayload = InvoiceDraft & {
    id: number;
    share_url?: string;
};

export default function InvoicesEdit({ invoiceId }: { invoiceId: number }) {
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);
    const [companyContext, setCompanyContext] =
        useState<InvoiceCompanyContext | null>(null);
    const [buyers, setBuyers] = useState<BuyerOption[]>([]);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<InvoiceFieldErrors>({});

    const applyDraft = useCallback(
        (
            payload: Record<string, unknown>,
            context?: InvoiceCompanyContext | null,
        ) => {
            const ctx = context ?? companyContextFromMeta(payload);
            setCompanyContext(ctx);
            setDraft(
                mergeCompanyContextIntoDraft(
                    invoicePayloadToDraft(payload),
                    ctx,
                ),
            );
        },
        [],
    );

    useEffect(() => {
        Promise.all([
            companyApiPost<ApiEnvelope<InvoicePayload>>(
                '/invoices/invoice-show',
                { id: invoiceId },
            ),
            companyApiPost<ApiEnvelope<BuyerOption[]>>('/buyers/buyers-list', {}),
        ]).then(([invoiceRes, buyersRes]) => {
            if (invoiceRes.success && invoiceRes.data) {
                const payload = invoiceRes.data as unknown as Record<
                    string,
                    unknown
                >;
                const status = String(payload.status ?? '');

                if (!invoiceIsEditable(status)) {
                    router.visit(route('invoices.show', invoiceId));

                    return;
                }

                applyDraft(payload);
            }
            if (buyersRes.success && buyersRes.data) {
                setBuyers(buyersRes.data);
            }
        });
    }, [applyDraft, invoiceId]);

    const handleChange = (next: InvoiceDraft) => {
        setDraft(mergeCompanyContextIntoDraft(next, companyContext));
        setErrors((prev) => syncLiveInvoiceErrors(next, prev));
    };

    const handleCompanyContextChange = (context: InvoiceCompanyContext) => {
        setCompanyContext(context);
        setDraft((prev) =>
            prev ? mergeCompanyContextIntoDraft(prev, context) : prev,
        );
    };

    const save = async () => {
        if (!draft?.id) {
            return;
        }
        setSaving(true);
        try {
            const result = await submitInvoiceForm(draft);
            if (result.ok) {
                router.visit(route('invoices.index'));
            } else {
                setErrors(result.errors);
                scrollToFirstInvoiceError(result.errors);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-foreground text-xl font-semibold">
                    Edit invoice
                </h2>
            }
        >
            <Head title="Edit invoice" />

            <div className="py-6">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {!draft ? (
                        <p className="text-muted-foreground text-sm">Loading…</p>
                    ) : (
                        <InvoiceBuilder
                            draft={draft}
                            buyers={buyers}
                            errors={errors}
                            onErrors={setErrors}
                            onChange={handleChange}
                            companyContext={companyContext}
                            onCompanyContextChange={handleCompanyContextChange}
                            onSave={() => void save()}
                            saving={saving}
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
