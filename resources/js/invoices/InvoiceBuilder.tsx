import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InvoicePreview from '@/invoices/InvoicePreview';
import type { BuyerOption } from '@/Pages/Invoices/types';
import BuyerSection from './sections/BuyerSection';
import GeneralSection from './sections/GeneralSection';
import TemplateSection from './sections/TemplateSection';
import ItemsSection from './sections/ItemsSection';
import TaxSettingsSection from './sections/TaxSettingsSection';
import type { CompanyTaxSettings } from './taxPresets';
import PaymentNotesSection from './sections/PaymentNotesSection';
import SellerSection from './sections/SellerSection';
import { buyerToDocumentParty } from './sections/BuyerSection';
import { emptyParty } from './defaultDraft';
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
    isNewInvoice?: boolean;
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
    isNewInvoice = false,
}: Props) {
    const update = (patch: Partial<InvoiceDraft>) =>
        onChange({ ...draft, ...patch });

    const updateDoc = (patch: Partial<InvoiceDraft['document']>) =>
        onChange({
            ...draft,
            document: { ...draft.document, ...patch },
        });

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
        if (!buyerId) {
            update({
                buyer_id: null,
                document: {
                    ...draft.document,
                    buyer: emptyParty(),
                },
            });
            return;
        }

        const buyer = buyers.find((b) => String(b.id) === buyerId);
        if (!buyer) {
            return;
        }

        update({
            buyer_id: buyer.id,
            document: {
                ...draft.document,
                buyer: buyerToDocumentParty(buyer),
            },
        });
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

                <TemplateSection
                    draft={draft}
                    onChange={update}
                    isNewInvoice={isNewInvoice}
                />
                <GeneralSection draft={draft} onChange={update} />
                <SellerSection
                    draft={draft}
                    onVisibilityChange={updateVisibility}
                />
                <BuyerSection
                    draft={draft}
                    buyers={buyers}
                    onBuyerSelect={applyBuyer}
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
