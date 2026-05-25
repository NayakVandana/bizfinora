import { readDiscountPercent, resolveDiscountForDraft } from './discount';
import type {
    InvoiceDocument,
    InvoiceDraft,
    InvoiceTotals,
    TaxBreakdownRow,
} from './types';

export function calculateTotalsForDraft(draft: InvoiceDraft): InvoiceTotals {
    const discountPercent = readDiscountPercent(draft);
    const totals = calculateTotals(
        draft.document,
        draft.tax_rate,
        draft.tax_type,
        resolveDiscountForDraft(draft),
        draft.tax_calculation_mode ?? 'exclusive',
        draft.tax_per_line ?? false,
        draft.tax_label,
    );

    return {
        ...totals,
        discount_type: 'percent',
        discount_percent:
            discountPercent > 0 ? discountPercent : undefined,
    };
}

export function grossLineSubtotal(document: InvoiceDocument): number {
    return Math.round(
        document.items.reduce((sum, item) => {
            const qty = Math.max(0, Number(item.quantity) || 0);
            const price = Math.max(0, Number(item.unit_price) || 0);

            return sum + qty * price;
        }, 0) * 100,
    ) / 100;
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

    const grossSubtotal =
        Math.round(lineTotals.reduce((a, b) => a + b, 0) * 100) / 100;
    const preDiscountNet =
        Math.round(lineNetExTax.reduce((a, b) => a + b, 0) * 100) / 100;
    const preDiscountTax =
        Math.round(lineTaxes.reduce((a, b) => a + b, 0) * 100) / 100;

    let appliedDiscount = Math.min(discount, grossSubtotal);
    let tax_amount = preDiscountTax;
    let total = 0;
    let tax_breakdown: TaxBreakdownRow[] = [];

    const invoiceLevelTax =
        !taxPerLine && taxType !== 'none' && effectiveRate > 0;

    if (invoiceLevelTax) {
        const taxableGross = Math.max(
            0,
            Math.round((grossSubtotal - appliedDiscount) * 100) / 100,
        );

        if (calculationMode === 'inclusive') {
            tax_amount =
                Math.round(
                    taxableGross * (effectiveRate / (100 + effectiveRate)) * 100,
                ) / 100;
            total = taxableGross;
        } else {
            tax_amount =
                Math.round(taxableGross * (effectiveRate / 100) * 100) / 100;
            total = Math.round((taxableGross + tax_amount) * 100) / 100;
        }

        tax_breakdown = buildInvoiceLevelTaxBreakdown(
            taxableGross,
            tax_amount,
            effectiveRate,
            taxLabel,
            calculationMode,
        );
    } else if (appliedDiscount > 0 && grossSubtotal > 0) {
        const ratio = (grossSubtotal - appliedDiscount) / grossSubtotal;
        tax_amount = Math.round(preDiscountTax * ratio * 100) / 100;

        if (calculationMode === 'inclusive') {
            total = Math.round((grossSubtotal - appliedDiscount) * 100) / 100;
        } else {
            const netAfter =
                Math.round((preDiscountNet - Math.min(appliedDiscount, preDiscountNet)) * 100) /
                100;
            total = Math.round((netAfter + tax_amount) * 100) / 100;
        }

        tax_breakdown = buildTaxBreakdown(
            document.items,
            lineNetExTax,
            lineTaxes,
            taxPerLine,
            effectiveRate,
            taxLabel,
            taxType,
            ratio,
        );
    } else {
        if (calculationMode === 'inclusive' && taxType !== 'none') {
            total = grossSubtotal;
        } else {
            total = Math.round((preDiscountNet + preDiscountTax) * 100) / 100;
        }

        tax_breakdown = buildTaxBreakdown(
            document.items,
            lineNetExTax,
            lineTaxes,
            taxPerLine,
            effectiveRate,
            taxLabel,
            taxType,
        );
    }

    return {
        subtotal: grossSubtotal,
        tax_amount,
        total,
        discount_amount: appliedDiscount,
        tax_breakdown,
    };
}

function buildInvoiceLevelTaxBreakdown(
    taxableGross: number,
    taxAmount: number,
    rate: number,
    taxLabel: string,
    calculationMode: InvoiceDraft['tax_calculation_mode'],
): TaxBreakdownRow[] {
    if (taxAmount <= 0) {
        return [];
    }

    const taxableBase =
        calculationMode === 'inclusive'
            ? Math.round((taxableGross - taxAmount) * 100) / 100
            : taxableGross;

    return [
        {
            rate,
            label: taxLabel,
            taxable: taxableBase,
            tax: taxAmount,
        },
    ];
}

function buildTaxBreakdown(
    items: InvoiceDocument['items'],
    lineNetExTax: number[],
    lineTaxes: number[],
    taxPerLine: boolean,
    invoiceTaxRate: number,
    taxLabel: string,
    taxType: InvoiceDraft['tax_type'],
    scale = 1,
): TaxBreakdownRow[] {
    if (taxType === 'none') {
        return [];
    }

    const groups: Record<string, TaxBreakdownRow> = {};

    items.forEach((item, index) => {
        const tax = Math.round((lineTaxes[index] ?? 0) * scale * 100) / 100;
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

        const taxable =
            Math.round((lineNetExTax[index] ?? 0) * scale * 100) / 100;
        groups[key].taxable += taxable;
        groups[key].tax += tax;
    });

    return Object.values(groups).map((row) => ({
        ...row,
        taxable: Math.round(row.taxable * 100) / 100,
        tax: Math.round(row.tax * 100) / 100,
    }));
}
