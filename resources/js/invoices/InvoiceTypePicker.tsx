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
                    <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
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
                                            ? 'rounded-lg border-2 border-ring bg-accent p-3 text-left text-accent-foreground ring-1 ring-ring'
                                            : 'rounded-lg border border-border bg-card p-3 text-left transition hover:border-accent hover:bg-muted'
                                    }
                                >
                                    <span
                                        className={
                                            selected
                                                ? 'text-sm font-semibold text-accent-foreground'
                                                : 'text-foreground text-sm font-semibold'
                                        }
                                    >
                                        {option.label}
                                    </span>
                                    <span className="text-muted-foreground mt-0.5 block text-xs line-clamp-2">
                                        {option.description}
                                    </span>
                                    <span className="text-muted-foreground mt-1 block text-[10px] font-medium uppercase tracking-wide">
                                        {FORMAT_LABELS[formatForInvoiceType(option.id)] ??
                                            option.layout}
                                    </span>
                                    {selected ? (
                                        <span className="font-medium text-sidebar-primary hover:opacity-80 mt-1 inline-block text-xs">
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
