import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Accordion from './Accordion';
import {
    invoiceFieldClass,
    invoiceItemErrorKey,
    type InvoiceFieldErrors,
} from '../validateInvoiceForm';
import type { InvoiceDraft, InvoiceLineItem } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
    onDocChange: (patch: Partial<InvoiceDraft['document']>) => void;
    onItemChange: (index: number, patch: Partial<InvoiceLineItem>) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
    errors?: InvoiceFieldErrors;
};

export default function ItemsSection({
    draft,
    onChange,
    onDocChange,
    onItemChange,
    onAddItem,
    onRemoveItem,
    errors = {},
}: Props) {
    const showLineTax = draft.tax_per_line && draft.tax_type !== 'none';

    return (
        <Accordion title="Invoice items *" defaultOpen>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                    Line items (description, qty, rate required)
                </span>
                <button
                    type="button"
                    className="font-medium text-sidebar-primary hover:opacity-80 text-sm"
                    onClick={onAddItem}
                >
                    + Add line
                </button>
            </div>

            <div data-invoice-field="items">
                <InputError message={errors.items} className="mb-2" />
            </div>

            {draft.document.items.map((item, index) => {
                const descError = errors[invoiceItemErrorKey(index, 'description')];
                const qtyError = errors[invoiceItemErrorKey(index, 'quantity')];
                const rateError = errors[invoiceItemErrorKey(index, 'unit_price')];

                return (
                <div
                    key={index}
                    className="grid gap-2 rounded border border-border bg-muted p-3 sm:grid-cols-12 sm:p-2"
                >
                    <div
                        className="sm:col-span-4"
                        data-invoice-field={invoiceItemErrorKey(index, 'description')}
                    >
                        <TextInput
                            className={invoiceFieldClass(Boolean(descError), 'w-full')}
                            placeholder="Description *"
                            value={item.description}
                            required
                            aria-invalid={Boolean(descError)}
                            onChange={(e) =>
                                onItemChange(index, {
                                    description: e.target.value,
                                })
                            }
                        />
                        <InputError
                            message={errors[invoiceItemErrorKey(index, 'description')]}
                            className="mt-1"
                        />
                    </div>
                    <div
                        className="sm:col-span-2"
                        data-invoice-field={invoiceItemErrorKey(index, 'quantity')}
                    >
                        <TextInput
                            type="number"
                            min="0.01"
                            step="0.01"
                            className={invoiceFieldClass(Boolean(qtyError), 'w-full')}
                            placeholder="Qty *"
                            value={item.quantity}
                            required
                            aria-invalid={Boolean(qtyError)}
                            onChange={(e) =>
                                onItemChange(index, {
                                    quantity: Number(e.target.value),
                                })
                            }
                        />
                        <InputError
                            message={errors[invoiceItemErrorKey(index, 'quantity')]}
                            className="mt-1"
                        />
                    </div>
                    <TextInput
                        className="sm:col-span-2"
                        placeholder="Unit"
                        value={item.unit ?? ''}
                        onChange={(e) =>
                            onItemChange(index, { unit: e.target.value })
                        }
                    />
                    <div
                        className="sm:col-span-2"
                        data-invoice-field={invoiceItemErrorKey(index, 'unit_price')}
                    >
                        <TextInput
                            type="number"
                            min="0.01"
                            step="0.01"
                            className={invoiceFieldClass(Boolean(rateError), 'w-full')}
                            placeholder="Rate *"
                            value={item.unit_price}
                            required
                            aria-invalid={Boolean(rateError)}
                            onChange={(e) =>
                                onItemChange(index, {
                                    unit_price: Number(e.target.value),
                                })
                            }
                        />
                        <InputError
                            message={errors[invoiceItemErrorKey(index, 'unit_price')]}
                            className="mt-1"
                        />
                    </div>
                    {showLineTax ? (
                        <TextInput
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            className="sm:col-span-2"
                            placeholder="Tax %"
                            value={item.tax_rate ?? draft.tax_rate}
                            onChange={(e) =>
                                onItemChange(index, {
                                    tax_rate: Number(e.target.value),
                                })
                            }
                        />
                    ) : null}
                    <button
                        type="button"
                        className="w-full rounded-md border border-red-100 py-2 text-sm text-red-600 hover:bg-red-50 sm:col-span-2 sm:border-0 sm:py-0 sm:hover:bg-transparent"
                        onClick={() => onRemoveItem(index)}
                    >
                        Remove line
                    </button>
                </div>
            );
            })}

            <div className="sm:col-span-3">
                <InputLabel value="Discount amount" />
                <TextInput
                    type="number"
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full"
                    value={draft.discount_amount ?? 0}
                    onChange={(e) => {
                        const amount = Number(e.target.value);
                        onChange({ discount_amount: amount });
                        onDocChange({ discount_amount: amount });
                    }}
                />
            </div>
        </Accordion>
    );
}
