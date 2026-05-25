import { grossLineSubtotal } from './calculateTotals';
import {
    DISCOUNT_PERCENT_MAX,
    readDiscountPercent,
} from './discount';
import type { InvoiceDraft } from './types';

export type InvoiceFieldErrors = Record<string, string>;

export function invoiceItemErrorKey(
    index: number,
    field: 'description' | 'quantity' | 'unit_price',
): string {
    return `items.${index}.${field}`;
}

/** Extra classes when a field failed client-side validation. */
export function invoiceFieldClass(hasError: boolean, base = ''): string {
    return hasError
        ? `${base} border-destructive ring-1 ring-destructive`.trim()
        : base;
}

export function scrollToFirstInvoiceError(errors: InvoiceFieldErrors): void {
    const order = [
        'invoice_number',
        'invoice_date',
        'buyer_id',
        'items',
        'discount_amount',
    ];

    for (const key of order) {
        if (errors[key]) {
            document
                .querySelector(`[data-invoice-field="${key}"]`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
    }

    const itemKey = Object.keys(errors).find((k) => k.startsWith('items.'));
    if (itemKey) {
        document
            .querySelector(`[data-invoice-field="${itemKey}"]`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

export function getDiscountAmountError(draft: InvoiceDraft): string | null {
    const lineGross = grossLineSubtotal(draft.document);
    const percent = readDiscountPercent(draft);

    if (percent <= 0) {
        return null;
    }

    if (lineGross <= 0) {
        return 'Add valid line items before applying a discount.';
    }

    if (percent > DISCOUNT_PERCENT_MAX) {
        return `Discount cannot exceed ${DISCOUNT_PERCENT_MAX}%.`;
    }

    return null;
}

export function validateInvoiceForm(draft: InvoiceDraft): InvoiceFieldErrors {
    const errors: InvoiceFieldErrors = {};

    if (!draft.invoice_number.trim()) {
        errors.invoice_number = 'Invoice number is required.';
    }

    if (!draft.invoice_date) {
        errors.invoice_date = 'Invoice date is required.';
    }

    if (!draft.buyer_id) {
        errors.buyer_id = 'Select a buyer.';
    }

    if (!draft.document.items.length) {
        errors.items = 'Add at least one line item.';
    }

    const discountError = getDiscountAmountError(draft);
    if (discountError) {
        errors.discount_amount = discountError;
    }

    draft.document.items.forEach((item, index) => {
        if (!item.description.trim()) {
            errors[invoiceItemErrorKey(index, 'description')] =
                'Description is required.';
        }

        if (
            !Number.isFinite(item.quantity) ||
            item.quantity <= 0
        ) {
            errors[invoiceItemErrorKey(index, 'quantity')] =
                'Quantity must be greater than 0.';
        }

        if (
            !Number.isFinite(item.unit_price) ||
            item.unit_price <= 0
        ) {
            errors[invoiceItemErrorKey(index, 'unit_price')] =
                'Unit price must be greater than 0.';
        }
    });

    return errors;
}

export function isInvoiceFormComplete(draft: InvoiceDraft): boolean {
    return Object.keys(validateInvoiceForm(draft)).length === 0;
}

export function clearResolvedInvoiceErrors(
    draft: InvoiceDraft,
    errors: InvoiceFieldErrors,
): InvoiceFieldErrors {
    if (Object.keys(errors).length === 0) {
        return errors;
    }

    const next = { ...errors };
    delete next._form;

    if (draft.invoice_number.trim()) {
        delete next.invoice_number;
    }
    if (draft.invoice_date) {
        delete next.invoice_date;
    }
    if (draft.buyer_id) {
        delete next.buyer_id;
    }
    if (draft.document.items.length > 0) {
        delete next.items;
    }

    if (!getDiscountAmountError(draft)) {
        delete next.discount_amount;
    } else {
        const discountError = getDiscountAmountError(draft);
        if (discountError) {
            next.discount_amount = discountError;
        }
    }

    draft.document.items.forEach((item, index) => {
        if (item.description.trim()) {
            delete next[invoiceItemErrorKey(index, 'description')];
        }
        if (Number.isFinite(item.quantity) && item.quantity > 0) {
            delete next[invoiceItemErrorKey(index, 'quantity')];
        }
        if (Number.isFinite(item.unit_price) && item.unit_price > 0) {
            delete next[invoiceItemErrorKey(index, 'unit_price')];
        }
    });

    return next;
}

/** Keep save-time errors; add or refresh live discount validation while editing. */
export function syncLiveInvoiceErrors(
    draft: InvoiceDraft,
    errors: InvoiceFieldErrors,
): InvoiceFieldErrors {
    const next = clearResolvedInvoiceErrors(draft, errors);
    const discountError = getDiscountAmountError(draft);

    if (discountError) {
        next.discount_amount = discountError;
    }

    return next;
}

export function mapInvoiceApiErrors(data: unknown): InvoiceFieldErrors {
    if (!data || typeof data !== 'object') {
        return {};
    }

    const out: InvoiceFieldErrors = {};
    const record = data as Record<string, unknown>;

    const topLevelKeys = [
        'invoice_number',
        'invoice_date',
        'buyer_id',
        'status',
        'template',
        'tax_type',
        'document',
        'document.items',
        'discount_amount',
    ];

    for (const key of topLevelKeys) {
        const val = record[key];
        if (Array.isArray(val) && typeof val[0] === 'string') {
            if (key === 'document.items') {
                out.items = val[0];
            } else if (key === 'buyer_id') {
                out.buyer_id = val[0];
            } else {
                out[key] = val[0];
            }
        } else if (typeof val === 'string') {
            out[key] = val;
        }
    }

    for (const [key, val] of Object.entries(record)) {
        const match = /^document\.items\.(\d+)\.(\w+)$/.exec(key);
        if (!match) {
            continue;
        }
        const index = match[1];
        const field = match[2];
        const message = Array.isArray(val)
            ? typeof val[0] === 'string'
                ? val[0]
                : null
            : typeof val === 'string'
              ? val
              : null;
        if (message) {
            out[`items.${index}.${field}`] = message;
        }
    }

    return out;
}
