import InputLabel from '@/Components/InputLabel';
import { formatForInvoiceType } from '../invoiceFormatConfig';
import InvoiceTypePicker from '../InvoiceTypePicker';
import { applyInvoiceTypeToDraft, invoiceTypeLabel } from '../invoiceTypes';
import Accordion from './Accordion';
import type { InvoiceDraft } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
};

export default function TemplateSection({ draft, onChange }: Props) {
    const selectType = (typeId: string) => {
        onChange(applyInvoiceTypeToDraft(draft, typeId));
    };

    return (
        <Accordion title="Invoice template" defaultOpen>
            <p className="text-sm text-gray-600">
                Each type generates a different PDF format (columns, tax
                blocks, trade fields, etc.). Preview updates on the right for{' '}
                <strong>
                    {invoiceTypeLabel(draft.invoice_type ?? 'standard')}
                </strong>{' '}
                ({formatForInvoiceType(draft.invoice_type ?? 'standard')}{' '}
                format).
            </p>
            <div>
                <InputLabel value="Invoice type" />
                <div className="mt-2">
                    <InvoiceTypePicker
                        value={draft.invoice_type ?? 'standard'}
                        onChange={selectType}
                        mode="preview"
                    />
                </div>
            </div>
        </Accordion>
    );
}
