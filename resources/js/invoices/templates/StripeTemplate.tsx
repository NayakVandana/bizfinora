import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { formatMoney } from '../formatMoney';
import type { InvoiceDraft, InvoiceTotals } from '../types';
import { PartyBlock } from './shared';
import { TaxTotalsBlock } from './TaxTotalsBlock';

const styles = {
    page: { fontFamily: 'Helvetica', fontSize: 10, color: '#0a2540' },
    bar: { height: 6, backgroundColor: '#fbbf24' },
    content: { padding: 36 },
    title: { fontSize: 28, fontWeight: 700, color: '#0a2540', marginBottom: 8 },
    meta: { color: '#425466', marginBottom: 20 },
    tableHead: {
        flexDirection: 'row' as const,
        borderBottomWidth: 1,
        borderBottomColor: '#e6ebf1',
        paddingBottom: 8,
        marginBottom: 4,
        color: '#425466',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row' as const,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f6f9fc',
    },
    totalBox: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f6f9fc',
        borderRadius: 4,
    },
};

export function StripeTemplate({
    draft,
    totals,
}: {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
}) {
    const { document: doc } = draft;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.bar} />
                <View style={styles.content}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            {doc.logo_data_url ? (
                                <Image
                                    src={doc.logo_data_url}
                                    style={{ width: 100, height: 40, marginBottom: 12, objectFit: 'contain' }}
                                />
                            ) : null}
                            <Text style={styles.title}>Invoice</Text>
                            <Text style={styles.meta}>#{draft.invoice_number}</Text>
                        </View>
                        <View style={{ textAlign: 'right', marginTop: 8 }}>
                            <Text style={{ fontWeight: 700 }}>{formatMoney(totals.total, draft.currency)}</Text>
                            <Text style={styles.meta}>due {draft.due_date || draft.issue_date}</Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                        <PartyBlock title="From" party={doc.seller} />
                        <PartyBlock title="Bill to" party={doc.buyer} />
                    </View>

                    <View style={styles.tableHead}>
                        <Text style={{ width: '50%' }}>Description</Text>
                        <Text style={{ width: '15%', textAlign: 'right' }}>Qty</Text>
                        <Text style={{ width: '17%', textAlign: 'right' }}>Unit price</Text>
                        <Text style={{ width: '18%', textAlign: 'right' }}>Amount</Text>
                    </View>

                    {doc.items.map((item, index) => {
                        const line =
                            Math.round(item.quantity * item.unit_price * 100) / 100;

                        return (
                            <View key={index} style={styles.tableRow}>
                                <Text style={{ width: '50%' }}>{item.description}</Text>
                                <Text style={{ width: '15%', textAlign: 'right' }}>{item.quantity}</Text>
                                <Text style={{ width: '17%', textAlign: 'right' }}>
                                    {formatMoney(item.unit_price, draft.currency)}
                                </Text>
                                <Text style={{ width: '18%', textAlign: 'right' }}>
                                    {formatMoney(line, draft.currency)}
                                </Text>
                            </View>
                        );
                    })}

                    <TaxTotalsBlock
                        draft={draft}
                        totals={totals}
                        boxStyle={styles.totalBox}
                    />

                    <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' }}>
                        <View style={{ maxWidth: '70%' }}>
                            {doc.notes ? <Text style={{ color: '#425466', marginBottom: 6 }}>{doc.notes}</Text> : null}
                            {doc.payment_terms ? (
                                <Text style={{ color: '#425466' }}>{doc.payment_terms}</Text>
                            ) : null}
                        </View>
                        {doc.qr_data_url ? (
                            <Image src={doc.qr_data_url} style={{ width: 72, height: 72 }} />
                        ) : null}
                    </View>
                </View>
            </Page>
        </Document>
    );
}
