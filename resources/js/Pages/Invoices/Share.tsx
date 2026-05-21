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
                    const { document, template, tax_type, tax_label, tax_rate, currency, language, issue_date, due_date, status, buyer_id, invoice_number } = res.data;
                    setDraft({
                        invoice_number,
                        status,
                        issue_date,
                        due_date: due_date ?? '',
                        currency,
                        language,
                        template,
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
        <div className="min-h-screen bg-gray-100">
            <Head title="Shared invoice" />

            <header className="border-b bg-white px-4 py-4 shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Shared invoice</p>
                        <h1 className="text-lg font-semibold">
                            {draft?.invoice_number ?? 'Invoice'}
                        </h1>
                    </div>
                    {draft ? (
                        <button
                            type="button"
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            onClick={() => void downloadInvoicePdf(draft)}
                        >
                            Download PDF
                        </button>
                    ) : null}
                </div>
            </header>

            <main className="mx-auto max-w-6xl p-4">
                {error ? (
                    <p className="text-red-600">{error}</p>
                ) : !draft ? (
                    <p className="text-gray-500">Loading preview…</p>
                ) : (
                    <div className="h-[80vh]">
                        <InvoicePreview draft={draft} />
                    </div>
                )}
            </main>
        </div>
    );
}
