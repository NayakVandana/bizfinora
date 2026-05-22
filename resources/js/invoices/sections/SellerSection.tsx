import Accordion from './Accordion';
import PartyFieldRow from './PartyFieldRow';
import type { InvoiceDraft } from '../types';
import { Link } from '@inertiajs/react';

type Props = {
    draft: InvoiceDraft;
    onVisibilityChange: (field: string, visible: boolean) => void;
};

export default function SellerSection({
    draft,
    onVisibilityChange,
}: Props) {
    const seller = draft.document.seller;
    const visibility = draft.field_visibility ?? {};

    const bankLine = [seller.account_number, seller.swift_bic]
        .filter(Boolean)
        .join(' · ');

    return (
        <Accordion title="Seller (your company)" defaultOpen>
            <p className="text-muted-foreground text-xs leading-snug">
                From{' '}
                <Link
                    href={route('companies.edit')}
                    className="font-medium text-sidebar-primary hover:opacity-80"
                >
                    company profile
                </Link>
                . Toggle PDF visibility per field.
            </p>

            <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-muted">
                <PartyFieldRow
                    label="Name"
                    value={seller.name}
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                    showToggle={false}
                />
                <PartyFieldRow
                    label="Address"
                    value={seller.address ?? seller.address_line1}
                    visibilityField="seller_address"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
                <PartyFieldRow
                    label="GSTIN"
                    value={seller.gst ?? seller.tax_id}
                    visibilityField="seller_tax_id"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
                <PartyFieldRow
                    label="PAN"
                    value={seller.pan}
                    visibilityField="seller_pan"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
                <PartyFieldRow
                    label="Email"
                    value={seller.email}
                    visibilityField="seller_email"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
                <PartyFieldRow
                    label="Phone"
                    value={seller.phone}
                    visibilityField="seller_phone"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
                <PartyFieldRow
                    label="Bank"
                    value={bankLine || null}
                    visibilityField="seller_bank"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
                <PartyFieldRow
                    label="Notes"
                    value={seller.notes}
                    visibilityField="seller_notes"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                />
                <PartyFieldRow
                    label="Logo"
                    visibility={visibility}
                    onVisibilityChange={onVisibilityChange}
                    visibilityField="seller_logo"
                >
                    {draft.document.logo_data_url ? (
                        <img
                            src={draft.document.logo_data_url}
                            alt=""
                            className="inline-block h-8 max-w-[120px] object-contain align-middle"
                        />
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    )}
                </PartyFieldRow>
            </div>
        </Accordion>
    );
}
