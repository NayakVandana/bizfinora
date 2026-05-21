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

function hasValue(value?: string | null): boolean {
    return Boolean(value?.trim());
}

export default function BuyerDetail({ buyer }: { buyer: BuyerOption }) {
    const company = buyer.company_name?.trim() || buyer.name;
    const hasStructured =
        hasValue(buyer.address_line1) ||
        hasValue(buyer.address_line2) ||
        hasValue(buyer.city) ||
        hasValue(buyer.state) ||
        hasValue(buyer.postal_code);

    return (
        <dl className="divide-y divide-gray-100">
            <DetailRow label="Company name" value={company} />
            <DetailRow label="Owner / contact" value={buyer.name} />
            <DetailRow label="Mobile" value={buyer.phone} />
            <DetailRow label="Email" value={buyer.email} />
            <DetailRow label="GSTIN" value={buyer.gst ?? buyer.tax_id} />
            <DetailRow label="PAN" value={buyer.pan} />
            <DetailRow label="Address" value={buyer.address} multiline />
            {hasStructured ? (
                <>
                    <DetailRow
                        label="Address line 1"
                        value={buyer.address_line1}
                    />
                    <DetailRow
                        label="Address line 2"
                        value={buyer.address_line2}
                    />
                    <DetailRow label="City" value={buyer.city} />
                    <DetailRow label="State" value={buyer.state} />
                    <DetailRow label="Postal code" value={buyer.postal_code} />
                </>
            ) : null}
            {hasValue(buyer.notes) ? (
                <DetailRow label="Notes" value={buyer.notes} multiline />
            ) : null}
        </dl>
    );
}
