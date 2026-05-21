import {
    buildDefaultDraft,
    emptyParty,
    partyFromSeller,
} from './defaultDraft';
import { APP_CURRENCY } from './currency';
import { formatForInvoiceType } from './invoiceFormatConfig';
import { applyInvoiceTypeToDraft } from './invoiceTypes';
import type { CompanyTaxSettings } from './taxPresets';
import type { InvoiceDraft, InvoiceLineItem, PartyDetails } from './types';

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
            '10 Commerce Street\nMumbai, India',
        country: seller.country?.trim() || 'India',
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
        country: 'United Kingdom',
    };
}

function previewItemsForType(
    invoiceType: string,
    taxRate: number,
): InvoiceLineItem[] {
    const format = formatForInvoiceType(invoiceType);

    if (format === 'timesheet') {
        return [
            {
                description: 'Application development',
                quantity: 32,
                unit: 'hrs',
                unit_price: 90,
                tax_rate: 0,
            },
            {
                description: 'Project management',
                quantity: 8,
                unit: 'hrs',
                unit_price: 75,
                tax_rate: 0,
            },
        ];
    }

    if (invoiceType === 'gst') {
        return [
            {
                description: 'SaaS platform license',
                quantity: 1,
                unit: '998314',
                unit_price: 12000,
                tax_rate: 18,
            },
            {
                description: 'On-site implementation',
                quantity: 5,
                unit: '998313',
                unit_price: 3500,
                tax_rate: 18,
            },
        ];
    }

    if (format === 'tax') {
        return [
            {
                description: 'Professional services',
                quantity: 1,
                unit: 'pcs',
                unit_price: 2500,
                tax_rate: taxRate,
            },
            {
                description: 'Support package',
                quantity: 12,
                unit: 'mo',
                unit_price: 199,
                tax_rate: taxRate,
            },
        ];
    }

    if (format === 'trade') {
        return [
            {
                description: 'Electronic components — Model X42',
                quantity: 500,
                unit: 'pcs',
                unit_price: 12.5,
                tax_rate: 0,
            },
            {
                description: 'Packaging and freight prep',
                quantity: 1,
                unit: 'lot',
                unit_price: 850,
                tax_rate: 0,
            },
        ];
    }

    if (invoiceType === 'receipt') {
        return [
            {
                description: 'Invoice PREVIEW-001 — full settlement',
                quantity: 1,
                unit: 'pcs',
                unit_price: 1450,
                tax_rate: 0,
            },
        ];
    }

    if (invoiceType === 'credit_memo') {
        return [
            {
                description: 'Return of defective units (credit)',
                quantity: 10,
                unit: 'pcs',
                unit_price: 45,
                tax_rate: taxRate,
            },
        ];
    }

    return [
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
    ];
}

/** Sample invoice used to preview template layouts in settings and picker UI. */
export function buildTemplatePreviewDraft(
    seller: PartyDetails,
    invoiceType: string,
    taxSettings?: CompanyTaxSettings | null,
): InvoiceDraft {
    const enrichedSeller = demoSeller(seller);
    const taxRate =
        (taxSettings?.default_tax_rate ?? 0) > 0
            ? taxSettings!.default_tax_rate
            : invoiceType === 'gst'
              ? 18
              : 20;

    const base = buildDefaultDraft(
        enrichedSeller,
        'PREVIEW-001',
        (seller as PartyDetails & { logo_data_url?: string | null })
            .logo_data_url ?? null,
        taxSettings,
        undefined,
        invoiceType,
    );

    const items = previewItemsForType(invoiceType, taxRate);

    return {
        ...base,
        ...applyInvoiceTypeToDraft(base, invoiceType),
        currency: APP_CURRENCY,
        document: {
            ...base.document,
            seller: enrichedSeller,
            buyer: demoBuyer(),
            items,
            payment_terms:
                formatForInvoiceType(invoiceType) === 'trade'
                    ? 'FOB · Payment within 30 days of BL date.'
                    : 'Payment due within 14 days.',
            notes: 'Thank you for your business.',
        },
    };
}
