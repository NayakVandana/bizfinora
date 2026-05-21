import type { InvoiceDraft, InvoiceTotals } from './types';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { StripeTemplate } from './templates/StripeTemplate';

export function InvoicePdfDocument({
    draft,
    totals,
}: {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
}) {
    if (draft.template === 'classic') {
        return <ClassicTemplate draft={draft} totals={totals} />;
    }

    return <StripeTemplate draft={draft} totals={totals} />;
}
