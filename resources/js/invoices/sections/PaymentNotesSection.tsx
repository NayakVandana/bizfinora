import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Accordion from './Accordion';
import type { InvoiceDraft } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
    onDocChange: (patch: Partial<InvoiceDraft['document']>) => void;
};

export default function PaymentNotesSection({
    draft,
    onChange,
    onDocChange,
}: Props) {
    return (
        <Accordion title="Payment, notes & QR">
            <div>
                <InputLabel value="Payment method" />
                <TextInput
                    className="mt-1 block w-full"
                    value={draft.payment_method ?? ''}
                    onChange={(e) => onChange({ payment_method: e.target.value })}
                />
            </div>
            <div>
                <InputLabel value="Pay online URL (Stripe, etc.)" />
                <TextInput
                    className="mt-1 block w-full"
                    value={draft.stripe_pay_url ?? ''}
                    onChange={(e) => onChange({ stripe_pay_url: e.target.value })}
                />
            </div>
            <div>
                <InputLabel value="QR code payload" />
                <TextInput
                    className="mt-1 block w-full"
                    value={draft.qr_code_data ?? draft.document.qr_payload ?? ''}
                    onChange={(e) => {
                        onChange({ qr_code_data: e.target.value });
                        onDocChange({ qr_payload: e.target.value });
                    }}
                />
            </div>
            <div>
                <InputLabel value="QR description" />
                <TextInput
                    className="mt-1 block w-full"
                    value={draft.qr_code_description ?? ''}
                    onChange={(e) =>
                        onChange({ qr_code_description: e.target.value })
                    }
                />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <InputLabel value="Authorized to receive" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={draft.person_authorized_receive ?? ''}
                        onChange={(e) =>
                            onChange({
                                person_authorized_receive: e.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <InputLabel value="Authorized to issue" />
                    <TextInput
                        className="mt-1 block w-full"
                        value={draft.person_authorized_issue ?? ''}
                        onChange={(e) =>
                            onChange({
                                person_authorized_issue: e.target.value,
                            })
                        }
                    />
                </div>
            </div>
            <div>
                <InputLabel value="Notes" />
                <textarea
                    className="app-field"
                    rows={2}
                    value={draft.document.notes ?? ''}
                    onChange={(e) => onDocChange({ notes: e.target.value })}
                />
            </div>
            <div>
                <InputLabel value="Payment terms" />
                <textarea
                    className="app-field"
                    rows={2}
                    value={draft.document.payment_terms ?? ''}
                    onChange={(e) =>
                        onDocChange({ payment_terms: e.target.value })
                    }
                />
            </div>
        </Accordion>
    );
}
