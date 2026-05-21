import type { BuyerOption } from '@/Pages/Invoices/types';

function DetailRow({
    label,
    value,
    multiline = false,
}: {
    label: string;
    value?: string | null;
    multiline?: boolean;
}) {
    const text = value?.trim() || '—';

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd
                className={`mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 ${
                    multiline ? 'whitespace-pre-wrap' : ''
                }`}
            >
                {text}
            </dd>
        </div>
    );
}

export default function BuyerDetail({ buyer }: { buyer: BuyerOption }) {
    const company = buyer.company_name?.trim() || buyer.name;

    return (
        <dl className="divide-y divide-gray-100">
            <DetailRow label="Company name" value={company} />
            <DetailRow label="Owner / contact" value={buyer.name} />
            <DetailRow label="Mobile" value={buyer.phone} />
            <DetailRow label="Email" value={buyer.email} />
            <DetailRow label="Address" value={buyer.address} multiline />
            <DetailRow label="GSTIN" value={buyer.gst ?? buyer.tax_id} />
            <DetailRow label="PAN" value={buyer.pan} />
            {buyer.notes?.trim() ? (
                <DetailRow label="Notes" value={buyer.notes} multiline />
            ) : null}
        </dl>
    );
}
