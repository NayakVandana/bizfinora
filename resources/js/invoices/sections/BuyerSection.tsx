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
    const gst = buyer.gst ?? buyer.tax_id ?? '';

    return {
        company_name: buyer.company_name ?? '',
        name: buyer.name ?? '',
        email: buyer.email,
        phone: buyer.phone,
        gst,
        pan: buyer.pan,
        tax_id: gst,
        tax_id_label: gst ? 'GSTIN' : 'GSTIN',
        address: buyer.address,
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

    return (
        <Accordion title="Buyer" defaultOpen>
            <p className="text-muted-foreground text-xs leading-snug">
                Select a saved buyer from{' '}
                <Link href={route('buyers.index')} className="font-medium text-sidebar-primary hover:opacity-80">
                    Buyers
                </Link>
                . Toggle PDF visibility per field.
            </p>

            <select
                className="app-field"
                value={draft.buyer_id ?? ''}
                onChange={(e) => onBuyerSelect(e.target.value)}
            >
                <option value="">Select saved buyer…</option>
                {buyers.map((b) => (
                    <option key={b.id} value={b.id}>
                        {b.company_name || b.name}
                    </option>
                ))}
            </select>

            {!draft.buyer_id ? (
                <p className="rounded-md border border-dashed border-border bg-muted px-3 py-4 text-center text-sm text-muted-foreground">
                    Choose a buyer to preview details and PDF fields.
                </p>
            ) : (
                <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted">
                    <PartyFieldRow
                        label="Company"
                        value={buyer.company_name ?? buyer.name}
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                        showToggle={false}
                    />
                    <PartyFieldRow
                        label="Owner"
                        value={buyer.name}
                        visibilityField="buyer_owner_name"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="Address"
                        value={buyer.address ?? buyer.address_line1}
                        visibilityField="buyer_address"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="Mobile"
                        value={buyer.phone}
                        visibilityField="buyer_phone"
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
                        label="GST"
                        value={buyer.gst ?? buyer.tax_id}
                        visibilityField="buyer_gst"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                    <PartyFieldRow
                        label="PAN"
                        value={buyer.pan}
                        visibilityField="buyer_pan"
                        visibility={visibility}
                        onVisibilityChange={onVisibilityChange}
                    />
                </div>
            )}
        </Accordion>
    );
}

export { buyerToDocumentParty };
