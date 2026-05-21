import type { InvoiceDraft, InvoiceTotals } from './types';
import { UnifiedInvoicePdf } from './templates/UnifiedInvoicePdf';

export function InvoicePdfDocument({
    draft,
    totals,
}: {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
}) {
    return <UnifiedInvoicePdf draft={draft} totals={totals} />;
}
