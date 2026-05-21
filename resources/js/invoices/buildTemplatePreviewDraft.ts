import {
    buildDefaultDraft,
    emptyParty,
    partyFromSeller,
} from './defaultDraft';
import type { CompanyTaxSettings } from './taxPresets';
import type { InvoiceDraft, InvoiceTemplate, PartyDetails } from './types';

function demoSeller(seller: PartyDetails): PartyDetails {
    return partyFromSeller({
        ...seller,
        name: seller.name?.trim() || 'Acme Trading Ltd',
        email: seller.email?.trim() || 'billing@acme.example',
        phone: seller.phone?.trim() || '+1 555 0100',
        tax_id: seller.tax_id?.trim() || 'TAX-123456',
        tax_id_label: seller.tax_id_label ?? 'VAT no',
        address:
            seller.address?.trim() ||
            '10 Commerce Street\nLondon, UK',
    });
}

function demoBuyer(): PartyDetails {
    return {
        ...emptyParty(),
        name: 'Sample Customer Ltd',
        email: 'accounts@samplecustomer.example',
        phone: '+1 555 0199',
        tax_id: 'GB123456789',
        tax_id_label: 'VAT no',
        address: '123 Client Street\nLondon, UK',
    };
}

/** Sample invoice used to preview template layouts in settings and picker UI. */
export function buildTemplatePreviewDraft(
    seller: PartyDetails,
    template: InvoiceTemplate,
    taxSettings?: CompanyTaxSettings | null,
): InvoiceDraft {
    const enrichedSeller = demoSeller(seller);
    const taxRate =
        (taxSettings?.default_tax_rate ?? 0) > 0
            ? taxSettings!.default_tax_rate
            : 20;

    const base = buildDefaultDraft(
        enrichedSeller,
        'PREVIEW-001',
        (seller as PartyDetails & { logo_data_url?: string | null })
            .logo_data_url ?? null,
        taxSettings,
        template,
    );

    return {
        ...base,
        currency: base.currency || 'USD',
        header_notes: 'Sample invoice for template preview',
        document: {
            ...base.document,
            seller: enrichedSeller,
            buyer: demoBuyer(),
            items: [
                {
                    description: 'Consulting services',
                    quantity: 8,
                    unit: 'hrs',
                    unit_price: 125,
                    tax_rate: taxRate,
                },
                {
                    description: 'Materials & supplies',
                    quantity: 1,
                    unit: 'lot',
                    unit_price: 450,
                    tax_rate: taxRate,
                },
            ],
            payment_terms: 'Payment due within 14 days.',
            notes: 'Thank you for your business.',
        },
    };
}
