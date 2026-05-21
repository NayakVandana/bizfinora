import type { BuyerOption } from '@/Pages/Invoices/types';
import Accordion from './Accordion';
import PartyFieldRow from './PartyFieldRow';
import type { InvoiceDraft } from '../types';
import { Link } from '@inertiajs/react';

type Props = {
    draft: InvoiceDraft;
    buyers: BuyerOption[];
    onBuyerSelect: (buyerId: string) => void;
    onVisibilityChange: (field: string, visible: boolean) => void;
};

function buyerToDocumentParty(buyer: BuyerOption): InvoiceDraft['document']['buyer'] {
    const address =
        buyer.address ||
        [
            buyer.address_line1,
            buyer.address_line2,
            [buyer.city, buyer.state, buyer.postal_code]
                .filter(Boolean)
                .join(', '),
            buyer.country,
        ]
            .filter(Boolean)
            .join('\n');

    return {
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        tax_id: buyer.tax_id,
        tax_id_label: buyer.tax_id_label ?? 'VAT no',
        address,
        address_line1: buyer.address_line1,
        address_line2: buyer.address_line2,
        city: buyer.city,
        state: buyer.state,
        postal_code: buyer.postal_code,
        country: buyer.country,
        account_number: buyer.account_number,
        swift_bic: buyer.swift_bic,
        notes: buyer.notes,
    };
}

export default function BuyerSection({
    draft,
    buyers,
    onBuyerSelect,
    onVisibilityChange,
}: Props) {
    const buyer = draft.document.buyer;
    const visibility = draft.field_visibility ?? {};

    const bankLine = [buyer.account_number, buyer.swift_bic]
        .filter(Boolean)
        .join(' · ');

    return (
        <Accordion title="Buyer" defaultOpen>
            <p className="text-xs leading-snug text-gray-600">
                Select a saved buyer from{' '}
                <Link
                    href={route('buyers.index')}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                >
                    Buyers
                </Link>
                . Toggle PDF visibility per field.
            </p>

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

            {!draft.buyer_id ? (
                <p className="rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
                    Choose a buyer to preview details and PDF fields.
                </p>
            ) : (
                <div className="divide-y divide-gray-100 overflow-hidden rounded-md border border-gray-200 bg-gray-50/80">
                    <PartyFieldRow
                        label="Name"
                        value={buyer.name}
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                        showToggle={false}
                    />
                    <PartyFieldRow
                        label="Address"
                        value={buyer.address ?? buyer.address_line1}
                        visibilityField="buyer_address"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="Tax label"
                        value={buyer.tax_id_label}
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                        showToggle={false}
                    />
                    <PartyFieldRow
                        label="Tax ID"
                        value={buyer.tax_id}
                        visibilityField="buyer_tax_id"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="Email"
                        value={buyer.email}
                        visibilityField="buyer_email"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="Phone"
                        value={buyer.phone}
                        visibilityField="buyer_phone"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="Bank"
                        value={bankLine || null}
                        visibilityField="buyer_bank"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="Notes"
                        value={buyer.notes}
                        visibilityField="buyer_notes"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                </div>
            )}
        </Accordion>
    );
}

export { buyerToDocumentParty };
