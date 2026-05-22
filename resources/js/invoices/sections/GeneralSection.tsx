import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Accordion from './Accordion';
import type { InvoiceDraft } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
};

export default function GeneralSection({ draft, onChange }: Props) {
    return (
        <Accordion title="General" defaultOpen>
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <InputLabel value="Invoice label" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={draft.invoice_number_label ?? 'Invoice #'}
                        onChange={(e) =>
                            onChange({ invoice_number_label: e.target.value })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="Invoice number" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={draft.invoice_number}
                        onChange={(e) =>
                            onChange({ invoice_number: e.target.value })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="Status" />
                    <select
                        className="app-field"
                        value={draft.status}
                        onChange={(e) =>
                            onChange({
                                status: e.target
                                    .value as InvoiceDraft['status'],
                            })
                        }
                    >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <div>
                    <InputLabel value="Invoice date label" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={draft.invoice_date_label ?? 'Invoice date'}
                        onChange={(e) =>
                            onChange({
                                invoice_date_label: e.target.value,
                            })
                        }
                        placeholder="Invoice date"
                    />
                </div>
                <div>
                    <InputLabel value="Invoice date" />
                    <TextInput
                        type="date"
                        className="mt-1 block w-full"
                        value={draft.invoice_date}
                        onChange={(e) =>
                            onChange({ invoice_date: e.target.value })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="Due date (optional)" />
                    <TextInput
                        type="date"
                        className="mt-1 block w-full"
                        value={draft.due_date ?? ''}
                        onChange={(e) =>
                            onChange({
                                due_date: e.target.value || '',
                            })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="Date of service (optional)" />
                    <TextInput
                        type="date"
                        className="mt-1 block w-full"
                        value={draft.date_of_service ?? ''}
                        onChange={(e) =>
                            onChange({
                                date_of_service: e.target.value || '',
                            })
                        }
                    />
                </div>
            </div>

            <div>
                <InputLabel value="Header notes" />
                <textarea
                    className="app-field"
                    rows={2}
                    value={draft.header_notes ?? ''}
                    onChange={(e) => onChange({ header_notes: e.target.value })}
                />
            </div>
        </Accordion>
    );
}
