import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { companyApiPost, type ApiEnvelope } from '@/api/invoiceClient';
import type { CompanySellerProfile } from '../types';
import Accordion from './Accordion';
import VisibilityToggle from './VisibilityToggle';
import type { InvoiceDraft } from '../types';

type Props = {
    draft: InvoiceDraft;
    onPartyChange: (
        patch: Partial<InvoiceDraft['document']['seller']>,
    ) => void;
    onVisibilityChange: (field: string, visible: boolean) => void;
};

export default function SellerSection({
    draft,
    onPartyChange,
    onVisibilityChange,
}: Props) {
    const seller = draft.document.seller;
    const visibility = draft.field_visibility ?? {};

    const saveProfileToCompany = async () => {
        const res = await companyApiPost<ApiEnvelope<CompanySellerProfile>>(
            '/company/company-profile-update',
            {
                address: seller.address ?? seller.address_line1,
                tax_id: seller.tax_id,
                tax_id_label: seller.tax_id_label,
                email: seller.email,
                phone: seller.phone,
                account_number: seller.account_number,
                swift_bic: seller.swift_bic,
                logo_data_url: draft.document.logo_data_url,
                seller_notes: seller.notes,
            },
        );
        if (res.success) {
            alert('Seller profile saved to company.');
        } else {
            alert(res.message ?? 'Could not save profile.');
        }
    };

    return (
        <Accordion title="Seller (your company)">
            <div className="grid gap-2 sm:grid-cols-2">
                <TextInput
                    placeholder="Company name"
                    value={seller.name}
                    onChange={(e) => onPartyChange({ name: e.target.value })}
                />
                <TextInput
                    placeholder="Tax ID label"
                    value={seller.tax_id_label ?? 'VAT no'}
                    onChange={(e) =>
                        onPartyChange({ tax_id_label: e.target.value })
                    }
                />
                <TextInput
                    placeholder="Tax ID"
                    value={seller.tax_id ?? ''}
                    onChange={(e) => onPartyChange({ tax_id: e.target.value })}
                />
                <TextInput
                    className="sm:col-span-2"
                    placeholder="Address"
                    value={seller.address ?? seller.address_line1 ?? ''}
                    onChange={(e) => onPartyChange({ address: e.target.value })}
                />
                <TextInput
                    placeholder="Email"
                    value={seller.email ?? ''}
                    onChange={(e) => onPartyChange({ email: e.target.value })}
                />
                <TextInput
                    placeholder="Phone"
                    value={seller.phone ?? ''}
                    onChange={(e) => onPartyChange({ phone: e.target.value })}
                />
                <TextInput
                    placeholder="Bank account"
                    value={seller.account_number ?? ''}
                    onChange={(e) =>
                        onPartyChange({ account_number: e.target.value })
                    }
                />
                <TextInput
                    placeholder="SWIFT / BIC"
                    value={seller.swift_bic ?? ''}
                    onChange={(e) =>
                        onPartyChange({ swift_bic: e.target.value })
                    }
                />
                <textarea
                    className="sm:col-span-2 rounded-md border-gray-300 shadow-sm"
                    placeholder="Seller notes"
                    rows={2}
                    value={seller.notes ?? ''}
                    onChange={(e) => onPartyChange({ notes: e.target.value })}
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <VisibilityToggle
                    label="tax ID"
                    field="seller_tax_id"
                    visibility={visibility}
                    onChange={onVisibilityChange}
                />
                <VisibilityToggle
                    label="email"
                    field="seller_email"
                    visibility={visibility}
                    onChange={onVisibilityChange}
                />
                <VisibilityToggle
                    label="phone"
                    field="seller_phone"
                    visibility={visibility}
                    onChange={onVisibilityChange}
                />
                <VisibilityToggle
                    label="bank details"
                    field="seller_bank"
                    visibility={visibility}
                    onChange={onVisibilityChange}
                />
            </div>

            <SecondaryButton type="button" onClick={() => void saveProfileToCompany()}>
                Save seller profile to company
            </SecondaryButton>

            <div>
                <InputLabel value="Logo (invoice only)" />
                <p className="text-xs text-gray-500">
                    Use General section to upload logo, or save profile to persist on company.
                </p>
            </div>
        </Accordion>
    );
}
