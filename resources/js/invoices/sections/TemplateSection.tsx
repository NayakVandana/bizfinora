import InputLabel from '@/Components/InputLabel';
import TemplatePicker from '../TemplatePicker';
import Accordion from './Accordion';
import type { InvoiceDraft, InvoiceTemplate } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
};

export default function TemplateSection({ draft, onChange }: Props) {
    return (
        <Accordion title="Template" defaultOpen>
            <p className="text-sm text-gray-600">
                Pick a layout — the live PDF preview updates on the right when
                you switch options.
            </p>
            <div>
                <InputLabel value="Preview options" />
                <div className="mt-2">
                    <TemplatePicker
                        value={draft.template}
                        onChange={(template: InvoiceTemplate) =>
                            onChange({ template })
                        }
                    />
                </div>
            </div>
        </Accordion>
    );
}
