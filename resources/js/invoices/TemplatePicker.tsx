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
                                ? 'rounded-lg border-2 border-indigo-600 bg-indigo-50 p-4 text-left ring-2 ring-indigo-200'
                                : 'rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-gray-300 hover:bg-gray-50'
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
                        <span className="mt-1 block text-xs text-gray-500">
                            {option.id === 'stripe'
                                ? 'Clean layout with bold totals and spacing.'
                                : 'Traditional invoice with structured blocks.'}
                        </span>
                        {selected ? (
                            <span className="mt-2 inline-block text-xs font-medium text-indigo-700">
                                {mode === 'select' ? 'Selected' : 'Previewing'}
                            </span>
                        ) : mode === 'preview' ? (
                            <span className="mt-2 inline-block text-xs text-gray-400">
                                Click to preview
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}
