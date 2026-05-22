import { INVOICE_TEMPLATES } from './templatePresets';
import type { InvoiceTemplate } from './types';

type Props = {
    value: InvoiceTemplate;
    onChange: (template: InvoiceTemplate) => void;
    /** select: default template page; preview: preview-only page / invoice builder */
    mode?: 'select' | 'preview';
};

export default function TemplatePicker({
    value,
    onChange,
    mode = 'preview',
}: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {INVOICE_TEMPLATES.map((option) => {
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
                        <span className="text-muted-foreground mt-1 block text-xs">
                            {option.id === 'stripe'
                                ? 'Clean layout with bold totals and spacing.'
                                : 'Traditional invoice with structured blocks.'}
                        </span>
                        {selected ? (
                            <span className="font-medium text-sidebar-primary hover:opacity-80 mt-2 inline-block text-xs">
                                {mode === 'select' ? 'Selected' : 'Previewing'}
                            </span>
                        ) : mode === 'preview' ? (
                            <span className="text-muted-foreground mt-2 inline-block text-xs">
                                Click to preview
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
