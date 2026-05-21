import type {
    InvoiceDocument,
    InvoiceDraft,
    InvoiceTotals,
    TaxBreakdownRow,
} from './types';

export function calculateTotalsForDraft(draft: InvoiceDraft): InvoiceTotals {
    return calculateTotals(
        draft.document,
        draft.tax_rate,
        draft.tax_type,
        draft.discount_amount ?? draft.document.discount_amount ?? 0,
        draft.tax_calculation_mode ?? 'exclusive',
        draft.tax_per_line ?? false,
        draft.tax_label,
    );
}

export function calculateTotals(
    document: InvoiceDocument,
    taxRate: number,
    taxType: InvoiceDraft['tax_type'],
    discountAmount = 0,
    calculationMode: InvoiceDraft['tax_calculation_mode'] = 'exclusive',
    taxPerLine = false,
    taxLabel = 'Tax',
): InvoiceTotals {
    const discount = Math.max(0, Number(discountAmount) || 0);
    const effectiveRate = taxType === 'none' ? 0 : Math.max(0, Number(taxRate) || 0);

    const lineTotals: number[] = [];
    const lineNetExTax: number[] = [];
    const lineTaxes: number[] = [];

    for (const item of document.items) {
        const qty = Math.max(0, Number(item.quantity) || 0);
        const price = Math.max(0, Number(item.unit_price) || 0);
        const lineGross = Math.round(qty * price * 100) / 100;
        lineTotals.push(lineGross);

        const rate =
            taxPerLine && item.tax_rate != null
                ? Math.max(0, Number(item.tax_rate))
                : effectiveRate;

        if (taxType === 'none' || rate <= 0) {
            lineNetExTax.push(lineGross);
            lineTaxes.push(0);
            continue;
        }

        if (calculationMode === 'inclusive') {
            const tax = Math.round((lineGross * (rate / (100 + rate))) * 100) / 100;
            lineNetExTax.push(Math.round((lineGross - tax) * 100) / 100);
            lineTaxes.push(tax);
        } else {
            lineNetExTax.push(lineGross);
            lineTaxes.push(Math.round(lineGross * (rate / 100) * 100) / 100);
        }
    }

    let subtotal = Math.round(lineNetExTax.reduce((a, b) => a + b, 0) * 100) / 100;
    let tax_amount = Math.round(lineTaxes.reduce((a, b) => a + b, 0) * 100) / 100;

    if (!taxPerLine && taxType !== 'none' && effectiveRate > 0) {
        const grossSubtotal =
            Math.round(lineTotals.reduce((a, b) => a + b, 0) * 100) / 100;
        const taxable = Math.max(
            0,
            Math.round((grossSubtotal - discount) * 100) / 100,
        );

        if (calculationMode === 'inclusive') {
            tax_amount =
                Math.round(
                    taxable * (effectiveRate / (100 + effectiveRate)) * 100,
                ) / 100;
            subtotal = Math.round((taxable - tax_amount) * 100) / 100;
        } else {
            subtotal = taxable;
            tax_amount =
                Math.round(taxable * (effectiveRate / 100) * 100) / 100;
        }
    } else if (discount > 0 && subtotal > 0) {
        const applied = Math.min(discount, subtotal);
        const ratio = (subtotal - applied) / subtotal;
        subtotal = Math.round((subtotal - applied) * 100) / 100;
        tax_amount = Math.round(tax_amount * ratio * 100) / 100;
    }

    const total = Math.round((subtotal + tax_amount) * 100) / 100;

    const tax_breakdown = buildTaxBreakdown(
        document.items,
        lineNetExTax,
        lineTaxes,
        taxPerLine,
        effectiveRate,
        taxLabel,
        taxType,
    );

    return {
        subtotal,
        tax_amount,
        total,
        discount_amount: discount,
        tax_breakdown,
    };
}

function buildTaxBreakdown(
    items: InvoiceDocument['items'],
    lineNetExTax: number[],
    lineTaxes: number[],
    taxPerLine: boolean,
    invoiceTaxRate: number,
    taxLabel: string,
    taxType: InvoiceDraft['tax_type'],
): TaxBreakdownRow[] {
    if (taxType === 'none') {
        return [];
    }

    const groups: Record<string, TaxBreakdownRow> = {};

    items.forEach((item, index) => {
        const tax = lineTaxes[index] ?? 0;
        if (tax <= 0) {
            return;
        }

        const rate =
            taxPerLine && item.tax_rate != null
                ? Number(item.tax_rate)
                : invoiceTaxRate;
        const key = String(rate);

        if (!groups[key]) {
            groups[key] = { rate, label: taxLabel, taxable: 0, tax: 0 };
        }

        groups[key].taxable += lineNetExTax[index] ?? 0;
        groups[key].tax += tax;
    });

    return Object.values(groups).map((row) => ({
        ...row,
        taxable: Math.round(row.taxable * 100) / 100,
        tax: Math.round(row.tax * 100) / 100,
    }));
}
