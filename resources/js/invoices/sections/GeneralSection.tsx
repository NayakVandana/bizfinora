import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Accordion from './Accordion';
import type { InvoiceDraft } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
    onLogoFile: (file: File | null) => void;
};

export default function GeneralSection({ draft, onChange, onLogoFile }: Props) {
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
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                    <InputLabel value="Language" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={draft.language}
                        onChange={(e) => onChange({ language: e.target.value })}
                    />
                </div>
                <div>
                    <InputLabel value="Issue date" />
                    <TextInput
                        type="date"
                        className="mt-1 block w-full"
                        value={draft.issue_date}
                        onChange={(e) => onChange({ issue_date: e.target.value })}
                    />
                </div>
                <div>
                    <InputLabel value="Due date" />
                    <TextInput
                        type="date"
                        className="mt-1 block w-full"
                        value={draft.due_date}
                        onChange={(e) => onChange({ due_date: e.target.value })}
                    />
                </div>
                <div>
                    <InputLabel value="Date of service" />
                    <TextInput
                        type="date"
                        className="mt-1 block w-full"
                        value={draft.date_of_service ?? ''}
                        onChange={(e) =>
                            onChange({ date_of_service: e.target.value })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="Date format" />
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        value={draft.date_format ?? 'YYYY-MM-DD'}
                        onChange={(e) => onChange({ date_format: e.target.value })}
                    >
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                </div>
                <div>
                    <InputLabel value="Currency" />
                    <p className="mt-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        Indian Rupee (INR) — Rs.
                    </p>
                </div>
            </div>

            <div>
                <InputLabel value="Header notes" />
                <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    rows={2}
                    value={draft.header_notes ?? ''}
                    onChange={(e) => onChange({ header_notes: e.target.value })}
                />
            </div>

            <div>
                <InputLabel value="Company logo" />
                <input
                    type="file"
                    accept="image/*"
                    className="mt-1 block w-full text-sm"
                    onChange={(e) => onLogoFile(e.target.files?.[0] ?? null)}
                />
            </div>
        </Accordion>
    );
}
