import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InvoicePreview from '@/invoices/InvoicePreview';
import type { BuyerOption } from '@/Pages/Invoices/types';
import BuyerSection from './sections/BuyerSection';
import GeneralSection from './sections/GeneralSection';
import ItemsSection from './sections/ItemsSection';
import TaxSettingsSection from './sections/TaxSettingsSection';
import type { CompanyTaxSettings } from './taxPresets';
import PaymentNotesSection from './sections/PaymentNotesSection';
import SellerSection from './sections/SellerSection';
import type { InvoiceDraft, InvoiceLineItem } from './types';

type Props = {
    draft: InvoiceDraft;
    buyers: BuyerOption[];
    onChange: (draft: InvoiceDraft) => void;
    onSave: () => void;
    onDownload: () => void;
    onEnableShare?: () => void;
    saving?: boolean;
    shareUrl?: string | null;
    companyTax?: CompanyTaxSettings | null;
};

export default function InvoiceBuilder({
    draft,
    buyers,
    onChange,
    onSave,
    onDownload,
    onEnableShare,
    saving = false,
    shareUrl,
    companyTax,
}: Props) {
    const update = (patch: Partial<InvoiceDraft>) =>
        onChange({ ...draft, ...patch });

    const updateDoc = (patch: Partial<InvoiceDraft['document']>) =>
        onChange({
            ...draft,
            document: { ...draft.document, ...patch },
        });

    const updateParty = (
        side: 'seller' | 'buyer',
        patch: Partial<InvoiceDraft['document']['seller']>,
    ) => updateDoc({ [side]: { ...draft.document[side], ...patch } });

    const updateVisibility = (field: string, visible: boolean) =>
        update({
            field_visibility: {
                ...(draft.field_visibility ?? {}),
                [field]: visible,
            },
        });

    const updateItem = (index: number, patch: Partial<InvoiceLineItem>) => {
        const items = draft.document.items.map((item, i) =>
            i === index ? { ...item, ...patch } : item,
        );
        updateDoc({ items });
    };

    const addItem = () =>
        updateDoc({
            items: [
                ...draft.document.items,
                {
                    description: '',
                    quantity: 1,
                    unit: 'pcs',
                    unit_price: 0,
                    tax_rate: draft.tax_rate,
                },
            ],
        });

    const removeItem = (index: number) => {
        if (draft.document.items.length <= 1) {
            return;
        }
        updateDoc({ items: draft.document.items.filter((_, i) => i !== index) });
    };

    const applyBuyer = (buyerId: string) => {
        const buyer = buyers.find((b) => String(b.id) === buyerId);
        if (!buyer) {
            return;
        }
        const address =
            buyer.address ||
            [
                buyer.address_line1,
                buyer.address_line2,
                [buyer.city, buyer.state, buyer.postal_code].filter(Boolean).join(', '),
                buyer.country,
            ]
                .filter(Boolean)
                .join('\n');

        update({
            buyer_id: buyer.id,
            document: {
                ...draft.document,
                buyer: {
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
                },
            },
        });
    };

    const onLogoFile = (file: File | null) => {
        if (!file) {
            updateDoc({ logo_data_url: null });

            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            updateDoc({ logo_data_url: reader.result as string });
        reader.readAsDataURL(file);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <div className="max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto rounded-lg bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    <PrimaryButton type="button" disabled={saving} onClick={onSave}>
                        {saving ? 'Saving…' : 'Save invoice'}
                    </PrimaryButton>
                    <SecondaryButton type="button" onClick={onDownload}>
                        Download PDF
                    </SecondaryButton>
                    {onEnableShare ? (
                        <SecondaryButton type="button" onClick={onEnableShare}>
                            {shareUrl ? 'Refresh share link' : 'Create share link'}
                        </SecondaryButton>
                    ) : null}
                </div>

                {shareUrl ? (
                    <div className="rounded border border-indigo-100 bg-indigo-50 p-3 text-sm">
                        <p className="font-medium text-indigo-900">Shareable link</p>
                        <a
                            href={shareUrl}
                            className="break-all text-indigo-700 underline"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {shareUrl}
                        </a>
                    </div>
                ) : null}

                <GeneralSection
                    draft={draft}
                    onChange={update}
                    onLogoFile={onLogoFile}
                />
                <SellerSection
                    draft={draft}
                    onPartyChange={(p) => updateParty('seller', p)}
                    onVisibilityChange={updateVisibility}
                />
                <BuyerSection
                    draft={draft}
                    buyers={buyers}
                    onBuyerSelect={applyBuyer}
                    onPartyChange={(p) => updateParty('buyer', p)}
                    onVisibilityChange={updateVisibility}
                />
                <TaxSettingsSection
                    draft={draft}
                    onChange={update}
                    companyTax={companyTax}
                />
                <ItemsSection
                    draft={draft}
                    onChange={update}
                    onDocChange={updateDoc}
                    onItemChange={updateItem}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                />
                <PaymentNotesSection
                    draft={draft}
                    onChange={update}
                    onDocChange={updateDoc}
                />
            </div>

            <div className="sticky top-4 h-[calc(100vh-6rem)]">
                <p className="mb-2 text-sm font-medium text-gray-700">
                    Live PDF preview
                </p>
                <InvoicePreview draft={draft} />
            </div>
        </div>
    );
}
