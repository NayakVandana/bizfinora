import { Text, View, type ViewProps } from '@react-pdf/renderer';
import { formatMoney } from '../formatMoney';
import type { InvoiceDraft, InvoiceTotals } from '../types';

export function TaxTotalsBlock({
    draft,
    totals,
    boxStyle,
    totalLabel = 'Total',
}: {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
    boxStyle?: ViewProps['style'];
    totalLabel?: string;
}) {
    const showSummary =
        draft.vat_summary_visible !== false &&
        (totals.tax_breakdown?.length ?? 0) > 1;

    return (
        <View style={boxStyle}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text>Subtotal</Text>
                <Text>{formatMoney(totals.subtotal, draft.currency)}</Text>
            </View>
            {totals.discount_amount > 0 ? (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 4,
                    }}
                >
                    <Text>
                        Discount
                        {totals.discount_percent != null
                            ? ` (${totals.discount_percent}%)`
                            : ''}
                    </Text>
                    <Text>-{formatMoney(totals.discount_amount, draft.currency)}</Text>
                </View>
            ) : null}
            {showSummary && totals.tax_breakdown ? (
                totals.tax_breakdown.map((row) => (
                    <View
                        key={row.rate}
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 4,
                        }}
                    >
                        <Text>
                            {row.label} {row.rate}% on{' '}
                            {formatMoney(row.taxable, draft.currency)}
                        </Text>
                        <Text>{formatMoney(row.tax, draft.currency)}</Text>
                    </View>
                ))
            ) : draft.tax_type !== 'none' && totals.tax_amount > 0 ? (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 4,
                    }}
                >
                    <Text>
                        {draft.tax_label}
                        {draft.tax_rate > 0 ? ` (${draft.tax_rate}%)` : ''}
                    </Text>
                    <Text>{formatMoney(totals.tax_amount, draft.currency)}</Text>
                </View>
            ) : null}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 8,
                }}
            >
                <Text style={{ fontWeight: 700, fontSize: 12 }}>
                    {totalLabel}
                </Text>
                <Text style={{ fontWeight: 700, fontSize: 12 }}>
                    {formatMoney(totals.total, draft.currency)}
                </Text>
            </View>
        </View>
    );
}
