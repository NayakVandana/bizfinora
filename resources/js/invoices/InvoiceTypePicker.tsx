import { formatForInvoiceType } from './invoiceFormatConfig';
import {
    INVOICE_TYPES,
    groupInvoiceTypesByCategory,
    invoiceTypeLabel,
    type InvoiceTypeOption,
} from './invoiceTypes';

const FORMAT_LABELS: Record<string, string> = {
    modern: 'Modern layout',
    classic: 'Classic layout',
    tax: 'Tax format',
    trade: 'Trade format',
    timesheet: 'Timesheet format',
    memo: 'Memo format',
    receipt: 'Receipt format',
};

type Props = {
    value: string;
    onChange: (typeId: string) => void;
    types?: InvoiceTypeOption[];
    mode?: 'select' | 'preview';
};

export default function InvoiceTypePicker({
    value,
    onChange,
    types = INVOICE_TYPES,
    mode = 'preview',
}: Props) {
    const groups = groupInvoiceTypesByCategory(types);

    return (
        <div className="max-h-[min(28rem,50vh)] space-y-4 overflow-y-auto pr-1">
            {groups.map((group) => (
                <div key={group.category}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {group.category_label}
                    </p>
                    <div className="grid gap-2">
                        {group.types.map((option) => {
                            const selected = value === option.id;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => onChange(option.id)}
                                    className={
                                        selected
                                            ? 'rounded-lg border-2 border-indigo-600 bg-indigo-50 p-3 text-left ring-1 ring-indigo-200'
                                            : 'rounded-lg border border-gray-200 bg-white p-3 text-left hover:border-gray-300 hover:bg-gray-50'
                                    }
                                >
                                    <span
                                        className={
                                            selected
                                                ? 'text-sm font-semibold text-indigo-900'
                                                : 'text-sm font-semibold text-gray-900'
                                        }
                                    >
                                        {option.label}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-gray-500 line-clamp-2">
                                        {option.description}
                                    </span>
                                    <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                        {FORMAT_LABELS[formatForInvoiceType(option.id)] ??
                                            option.layout}
                                    </span>
                                    {selected ? (
                                        <span className="mt-1 inline-block text-xs font-medium text-indigo-700">
                                            {mode === 'select'
                                                ? 'Selected'
                                                : 'Previewing'}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export { invoiceTypeLabel };
