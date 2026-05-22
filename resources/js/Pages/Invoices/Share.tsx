import { apiPost, type ApiEnvelope } from '@/api/apiClient';
import InvoicePreview from '@/invoices/InvoicePreview';
import type { InvoiceDraft } from '@/invoices/types';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type SharedInvoice = InvoiceDraft & {
    invoice_number: string;
    company_name?: string;
};

export default function InvoicesShare({ shareToken }: { shareToken: string }) {
    const [draft, setDraft] = useState<InvoiceDraft | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        apiPost<ApiEnvelope<SharedInvoice>>('/api/v1/share/invoice-show', {
            token: shareToken,
        })
            .then((res) => {
                if (res.success && res.data) {
                    const {
                        document,
                        template,
                        invoice_type,
                        tax_type,
                        tax_label,
                        tax_rate,
                        currency,
                        language,
                        invoice_date,
                        due_date,
                        status,
                        buyer_id,
                        invoice_number,
                    } = res.data;
                    setDraft({
                        invoice_number,
                        status,
                        invoice_date,
                        due_date: due_date ?? '',
                        currency,
                        language,
                        template,
                        invoice_type: invoice_type ?? 'standard',
                        tax_type,
                        tax_label,
                        tax_rate,
                        buyer_id,
                        document,
                    });
                } else {
                    setError(res.message);
                }
            })
            .catch(() => setError('Could not load invoice.'));
    }, [shareToken]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Head title="Shared invoice" />

            <header className="border-b border-border bg-card px-4 py-4 shadow-sm">
                <div className="flex w-full items-center justify-between">
                    <div>
                        <p className="text-muted-foreground text-sm">Shared invoice</p>
                        <h1 className="text-foreground text-lg font-semibold">
                            {draft?.invoice_number ?? 'Invoice'}
                        </h1>
                    </div>
                    {draft ? (
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                            onClick={() => void downloadInvoicePdf(draft)}
                        >
                            Download PDF
                        </button>
                    ) : null}
                </div>
            </header>

            <main className="w-full p-4">
                {error ? (
                    <p className="text-red-600">{error}</p>
                ) : !draft ? (
                    <p className="text-muted-foreground text-sm">Loading preview…</p>
                ) : (
                    <InvoicePreview draft={draft} />
                )}
            </main>
        </div>
    );
}
