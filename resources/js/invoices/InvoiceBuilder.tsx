import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import InvoiceEditorLayout from '@/invoices/InvoiceEditorLayout';
import InvoicePreview from '@/invoices/InvoicePreview';
import type { BuyerOption } from '@/Pages/Invoices/types';
import BuyerSection from './sections/BuyerSection';
import GeneralSection from './sections/GeneralSection';
import TemplateSection from './sections/TemplateSection';
import ItemsSection from './sections/ItemsSection';
import TaxSettingsSection from './sections/TaxSettingsSection';
import PaymentNotesSection from './sections/PaymentNotesSection';
import TermsAndConditionsSection from './sections/TermsAndConditionsSection';
import AuthorizedSignatureSection from './sections/AuthorizedSignatureSection';
import SellerSection from './sections/SellerSection';
import { buyerToDocumentParty } from './sections/BuyerSection';
import { emptyParty } from './defaultDraft';
import {
    scrollToFirstInvoiceError,
    validateInvoiceForm,
    type InvoiceFieldErrors,
} from './validateInvoiceForm';
import type { InvoiceDraft, InvoiceLineItem } from './types';
import type { InvoiceCompanyContext } from './companyContext';

type Props = {
    draft: InvoiceDraft;
    buyers: BuyerOption[];
    onChange: (draft: InvoiceDraft) => void;
    errors?: InvoiceFieldErrors;
    onErrors?: (errors: InvoiceFieldErrors) => void;
    onSave: () => void | Promise<void>;
    saving?: boolean;
    companyContext?: InvoiceCompanyContext | null;
    onCompanyContextChange?: (context: InvoiceCompanyContext) => void;
    isNewInvoice?: boolean;
};

export default function InvoiceBuilder({
    draft,
    buyers,
    onChange,
    errors = {},
    onErrors,
    onSave,
    saving = false,
    companyContext,
    onCompanyContextChange,
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

    const handleSave = () => {
        const clientErrors = validateInvoiceForm(draft);
        if (Object.keys(clientErrors).length > 0) {
            onErrors?.(clientErrors);
            scrollToFirstInvoiceError(clientErrors);
            return;
        }
        void onSave();
    };

    const actions = (
        <PrimaryButton
            type="submit"
            form="invoice-builder-form"
            disabled={saving}
            className="w-full justify-center lg:w-auto"
        >
            {saving ? 'Saving…' : 'Save invoice'}
        </PrimaryButton>
    );

    return (
        <InvoiceEditorLayout
            actions={actions}
            preview={<InvoicePreview draft={draft} />}
            form={
                <>
                    <form
                        id="invoice-builder-form"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        <InputError message={errors._form} className="mb-2" />

                        <TemplateSection
                            draft={draft}
                            onChange={update}
                            isNewInvoice={isNewInvoice}
                        />
                        <GeneralSection
                            draft={draft}
                            onChange={update}
                            errors={errors}
                        />
                        <SellerSection
                            draft={draft}
                            onVisibilityChange={updateVisibility}
                        />
                        <BuyerSection
                            draft={draft}
                            buyers={buyers}
                            onBuyerSelect={applyBuyer}
                            onVisibilityChange={updateVisibility}
                            errors={errors}
                        />
                        <TaxSettingsSection draft={draft} onChange={update} />
                        <ItemsSection
                            draft={draft}
                            onChange={update}
                            onItemChange={updateItem}
                            onAddItem={addItem}
                            onRemoveItem={removeItem}
                            errors={errors}
                        />
                        <PaymentNotesSection
                            draft={draft}
                            companyContext={companyContext ?? {}}
                            onCompanyContextChange={
                                onCompanyContextChange ?? (() => {})
                            }
                        />
                        <TermsAndConditionsSection
                            draft={draft}
                            companyContext={companyContext ?? {}}
                            onCompanyContextChange={
                                onCompanyContextChange ?? (() => {})
                            }
                        />
                        <AuthorizedSignatureSection
                            draft={draft}
                            companyContext={companyContext ?? {}}
                            onCompanyContextChange={
                                onCompanyContextChange ?? (() => {})
                            }
                        />
                    </form>
                </>
            }
        />
    );
}
