import { formatMoney } from '@/invoices/formatMoney';
import type {
    InvoiceStatusFilter,
    InvoiceSummary,
} from '@/types/invoiceSummary';

const tabs: { id: InvoiceStatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'unpaid', label: 'Unpaid' },
    { id: 'paid', label: 'Paid' },
    { id: 'rejected', label: 'Rejected' },
];

type Props = {
    summary: InvoiceSummary;
    active: InvoiceStatusFilter;
    onChange: (status: InvoiceStatusFilter) => void;
};

export default function InvoiceStatusSummaryBar({
    summary,
    active,
    onChange,
}: Props) {
    return (
        <div className="grid gap-2 border-b border-border px-4 py-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {tabs.map((tab) => {
                const slice = summary[tab.id];
                const isActive = active === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`rounded-lg border px-3 py-2 text-left transition ${
                            isActive
                                ? 'border-sidebar-primary bg-sidebar-primary/5'
                                : 'border-border bg-card hover:border-sidebar-primary/40'
                        }`}
                    >
                        <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                            {tab.label}
                        </p>
                        <p className="text-foreground mt-1 text-lg font-semibold">
                            {formatMoney(slice.amount)}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                            {slice.count} invoice{slice.count === 1 ? '' : 's'}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}
