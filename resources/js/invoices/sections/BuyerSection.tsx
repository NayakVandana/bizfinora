import TextInput from '@/Components/TextInput';
import type { BuyerOption } from '@/Pages/Invoices/types';
import Accordion from './Accordion';
import VisibilityToggle from './VisibilityToggle';
import type { InvoiceDraft } from '../types';

type Props = {
    draft: InvoiceDraft;
    buyers: BuyerOption[];
    onBuyerSelect: (buyerId: string) => void;
    onPartyChange: (patch: Partial<InvoiceDraft['document']['buyer']>) => void;
    onVisibilityChange: (field: string, visible: boolean) => void;
};

export default function BuyerSection({
    draft,
    buyers,
    onBuyerSelect,
    onPartyChange,
    onVisibilityChange,
}: Props) {
    const buyer = draft.document.buyer;
    const visibility = draft.field_visibility ?? {};

    return (
        <Accordion title="Buyer">
            <select
                className="block w-full rounded-md border-gray-300 text-sm shadow-sm"
                value={draft.buyer_id ?? ''}
                onChange={(e) => onBuyerSelect(e.target.value)}
            >
                <option value="">Select saved buyer…</option>
                {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                        {b.name}
                    </option>
                ))}
            </select>

            <div className="grid gap-2 sm:grid-cols-2">
                <TextInput
                    placeholder="Buyer name"
                    value={buyer.name}
                    onChange={(e) => onPartyChange({ name: e.target.value })}
                />
                <TextInput
                    placeholder="Tax ID label"
                    value={buyer.tax_id_label ?? 'VAT no'}
                    onChange={(e) =>
                        onPartyChange({ tax_id_label: e.target.value })
                    }
                />
                <TextInput
                    placeholder="Tax ID"
                    value={buyer.tax_id ?? ''}
                    onChange={(e) => onPartyChange({ tax_id: e.target.value })}
                />
                <TextInput
                    className="sm:col-span-2"
                    placeholder="Address"
                    value={buyer.address ?? buyer.address_line1 ?? ''}
                    onChange={(e) => onPartyChange({ address: e.target.value })}
                />
                <TextInput
                    placeholder="Email"
                    value={buyer.email ?? ''}
                    onChange={(e) => onPartyChange({ email: e.target.value })}
                />
                <TextInput
                    placeholder="Phone"
                    value={buyer.phone ?? ''}
                    onChange={(e) => onPartyChange({ phone: e.target.value })}
                />
                <TextInput
                    placeholder="Bank account"
                    value={buyer.account_number ?? ''}
                    onChange={(e) =>
                        onPartyChange({ account_number: e.target.value })
                    }
                />
                <TextInput
                    placeholder="SWIFT / BIC"
                    value={buyer.swift_bic ?? ''}
                    onChange={(e) =>
                        onPartyChange({ swift_bic: e.target.value })
                    }
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <VisibilityToggle
                    label="tax ID"
                    field="buyer_tax_id"
                    visibility={visibility}
                    onChange={onVisibilityChange}
                />
                <VisibilityToggle
                    label="email"
                    field="buyer_email"
                    visibility={visibility}
                    onChange={onVisibilityChange}
                />
                <VisibilityToggle
                    label="phone"
                    field="buyer_phone"
                    visibility={visibility}
                    onChange={onVisibilityChange}
                />
            </div>
        </Accordion>
    );
}
