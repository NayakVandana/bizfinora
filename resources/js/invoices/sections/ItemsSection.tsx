import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Accordion from './Accordion';
import type { InvoiceDraft, InvoiceLineItem } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
    onDocChange: (patch: Partial<InvoiceDraft['document']>) => void;
    onItemChange: (index: number, patch: Partial<InvoiceLineItem>) => void;
    onAddItem: () => void;
    onRemoveItem: (index: number) => void;
};

export default function ItemsSection({
    draft,
    onChange,
    onDocChange,
    onItemChange,
    onAddItem,
    onRemoveItem,
}: Props) {
    const showLineTax = draft.tax_per_line && draft.tax_type !== 'none';

    return (
        <Accordion title="Invoice items" defaultOpen>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Line items</span>
                <button
                    type="button"
                    className="text-sm text-indigo-600"
                    onClick={onAddItem}
                >
                    + Add line
                </button>
            </div>

            {draft.document.items.map((item, index) => (
                <div
                    key={index}
                    className="grid gap-2 rounded border border-gray-100 p-3 sm:grid-cols-12 sm:p-2"
                >
                    <TextInput
                        className="w-full sm:col-span-4"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) =>
                            onItemChange(index, {
                                description: e.target.value,
                            })
                        }
                    />
                    <TextInput
                        type="number"
                        min="0"
                        step="0.01"
                        className="sm:col-span-2"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) =>
                            onItemChange(index, {
                                quantity: Number(e.target.value),
                            })
                        }
                    />
                    <TextInput
                        className="sm:col-span-2"
                        placeholder="Unit"
                        value={item.unit ?? ''}
                        onChange={(e) =>
                            onItemChange(index, { unit: e.target.value })
                        }
                    />
                    <TextInput
                        type="number"
                        min="0"
                        step="0.01"
                        className="sm:col-span-2"
                        placeholder="Rate"
                        value={item.unit_price}
                        onChange={(e) =>
                            onItemChange(index, {
                                unit_price: Number(e.target.value),
                            })
                        }
                    />
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
            ))}

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
