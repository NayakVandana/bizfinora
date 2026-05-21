import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { invoiceDateDisplay } from '../formatInvoiceDate';
import { formatMoney } from '../formatMoney';
import type { InvoiceDraft, InvoiceTotals } from '../types';
import { PartyBlock } from './shared';
import { TaxTotalsBlock } from './TaxTotalsBlock';
import {
    accentColorForDraft,
    documentTitleForDraft,
} from './invoiceTypePresentation';

const styles = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, color: '#0a2540' },
    bar: { height: 6, backgroundColor: '#fbbf24' },
    content: { padding: 36 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    title: { fontSize: 28, fontWeight: 700, color: '#0a2540', marginBottom: 4 },
    meta: { color: '#425466', fontSize: 10 },
    amountDue: { fontWeight: 700, fontSize: 14, color: '#0a2540' },
    parties: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    tableHead: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e6ebf1',
        paddingBottom: 8,
        marginBottom: 2,
        color: '#425466',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f6f9fc',
    },
    colDesc: { width: '50%', paddingRight: 8 },
    colQty: { width: '15%', textAlign: 'right' },
    colPrice: { width: '17%', textAlign: 'right' },
    colTotal: { width: '18%', textAlign: 'right' },
    totalsWrap: {
        marginTop: 12,
        alignItems: 'flex-end',
    },
    totalBox: {
        width: 240,
        padding: 14,
        backgroundColor: '#f6f9fc',
        borderRadius: 4,
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
    },
    footerNotes: { maxWidth: '70%' },
    noteText: { color: '#425466', fontSize: 9, lineHeight: 1.4 },
});

export function StripeTemplate({
    draft,
    totals,
}: {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
}) {
    const { document: doc } = draft;
    const title = documentTitleForDraft(draft.invoice_type ?? 'standard');
    const barColor = accentColorForDraft(draft.invoice_type ?? 'standard');

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={[styles.bar, { backgroundColor: barColor }]} />
                <View style={styles.content}>
                    <View style={styles.headerRow}>
                        <View style={{ maxWidth: '55%' }}>
                            {doc.logo_data_url ? (
                                <Image
                                    src={doc.logo_data_url}
                                    style={{
                                        width: 100,
                                        height: 40,
                                        marginBottom: 12,
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : null}
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.meta}>
                                {draft.invoice_number_label ?? 'Invoice #'}{' '}
                                {draft.invoice_number}
                            </Text>
                            <Text style={styles.meta}>
                                {invoiceDateDisplay(
                                    draft.invoice_date,
                                    draft.invoice_date_label,
                                    draft.date_format,
                                )}
                                {draft.due_date
                                    ? ` · Due ${draft.due_date}`
                                    : ''}
                            </Text>
                        </View>
                        <View style={{ textAlign: 'right' }}>
                            <Text style={styles.amountDue}>
                                {formatMoney(totals.total, draft.currency)}
                            </Text>
                            <Text style={styles.meta}>Amount due</Text>
                        </View>
                    </View>

                    <View style={styles.parties}>
                        <PartyBlock title="From" party={doc.seller} />
                        <PartyBlock title="Bill to" party={doc.buyer} />
                    </View>

                    <View style={styles.tableHead}>
                        <Text style={styles.colDesc}>Description</Text>
                        <Text style={styles.colQty}>Qty</Text>
                        <Text style={styles.colPrice}>Unit price</Text>
                        <Text style={styles.colTotal}>Amount</Text>
                    </View>

                    {doc.items.map((item, index) => {
                        const line =
                            Math.round(
                                item.quantity * item.unit_price * 100,
                            ) / 100;

                        return (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.colDesc}>
                                    <Text>{item.description}</Text>
                                </View>
                                <View style={styles.colQty}>
                                    <Text>{item.quantity}</Text>
                                </View>
                                <View style={styles.colPrice}>
                                    <Text>
                                        {formatMoney(
                                            item.unit_price,
                                            draft.currency,
                                        )}
                                    </Text>
                                </View>
                                <View style={styles.colTotal}>
                                    <Text>
                                        {formatMoney(line, draft.currency)}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}

                    <View style={styles.totalsWrap}>
                        <TaxTotalsBlock
                            draft={draft}
                            totals={totals}
                            boxStyle={styles.totalBox}
                        />
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.footerNotes}>
                            {doc.notes ? (
                                <Text style={styles.noteText}>{doc.notes}</Text>
                            ) : null}
                            {doc.payment_terms ? (
                                <Text
                                    style={[
                                        styles.noteText,
                                        { marginTop: doc.notes ? 6 : 0 },
                                    ]}
                                >
                                    {doc.payment_terms}
                                </Text>
                            ) : null}
                        </View>
                        {doc.qr_data_url ? (
                            <Image
                                src={doc.qr_data_url}
                                style={{ width: 72, height: 72 }}
                            />
                        ) : null}
                    </View>
                </View>
            </Page>
        </Document>
    );
}
