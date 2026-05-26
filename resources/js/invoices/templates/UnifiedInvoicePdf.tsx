import {
    Document,
    Image,
    Page,
    StyleSheet,
    Text,
    View,
} from '@react-pdf/renderer';
import { buildFormatConfig } from '../invoiceFormatConfig';
import type { TableColumnKey } from '../invoiceFormatConfig';
import { formatInvoiceDate, invoiceDateDisplay } from '../formatInvoiceDate';
import { isPartyFieldVisible, showPartyLogo } from '../partyPdfLines';
import { formatMoney } from '../formatMoney';
import type { InvoiceDraft, InvoiceLineItem, InvoiceTotals } from '../types';
import { isTermsAndConditionsVisible } from '../termsSettings';
import { SignatureBlockPdf } from './SignatureBlockPdf';
import { PartyBlock } from './shared';
import { PaymentBlockPdf } from './PaymentBlockPdf';
import { TaxTotalsBlock } from './TaxTotalsBlock';

const s = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, color: '#111827' },
    bar: { height: 6 },
    content: { padding: 32 },
    classicPage: { padding: 32, fontSize: 10, fontFamily: 'Helvetica' },
    banner: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        padding: 8,
        marginBottom: 12,
        borderRadius: 4,
    },
    bannerText: { fontSize: 9, fontWeight: 700, color: '#b91c1c', textAlign: 'center' },
    bannerOk: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
    bannerOkText: { color: '#047857' },
    taxHeader: {
        borderWidth: 2,
        borderColor: '#4c1d95',
        padding: 12,
        marginBottom: 16,
    },
    taxTitle: { fontSize: 22, fontWeight: 700, color: '#4c1d95', textAlign: 'center' },
    taxIdRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
        padding: 8,
        backgroundColor: '#f5f3ff',
    },
    tradeMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    tradeMetaCell: { width: '30%' },
    tradeMetaLabel: { fontSize: 8, color: '#6b7280', marginBottom: 2 },
    tradeMetaValue: { fontSize: 10, fontWeight: 700 },
    title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
    titleClassic: { fontSize: 22, fontWeight: 700 },
    muted: { fontSize: 9, color: '#6b7280' },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    amountBox: { textAlign: 'right' },
    parties: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    tableHead: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 6,
        backgroundColor: '#f3f4f6',
        borderBottomWidth: 1,
        borderColor: '#d1d5db',
    },
    tableHeadModern: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        paddingBottom: 6,
        marginBottom: 2,
        color: '#6b7280',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
    },
    tableRowModern: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#f9fafb',
    },
    col: { paddingRight: 4 },
    colRight: { textAlign: 'right' },
    totalsWrap: { marginTop: 12, alignItems: 'flex-end' },
    totalBox: {
        width: 250,
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 4,
    },
    totalBoxTax: {
        width: '100%',
        padding: 12,
        backgroundColor: '#faf5ff',
        borderWidth: 1,
        borderColor: '#ddd6fe',
        marginTop: 8,
    },
    footer: { marginTop: 16 },
    declaration: {
        marginTop: 10,
        fontSize: 8,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    receiptPaid: {
        fontSize: 32,
        fontWeight: 700,
        color: '#059669',
        marginBottom: 8,
    },
});

const COL_WIDTH: Record<TableColumnKey, string> = {
    description: '32%',
    hsn: '12%',
    qty: '10%',
    unit: '10%',
    hours: '12%',
    rate: '14%',
    tax: '10%',
    amount: '14%',
};

function colStyle(key: TableColumnKey, modern: boolean) {
    const width = COL_WIDTH[key] ?? '15%';

    return [
        { width },
        modern && (key === 'qty' || key === 'rate' || key === 'tax' || key === 'amount' || key === 'hours')
            ? s.colRight
            : {},
        !modern && key !== 'description' ? s.colRight : {},
    ];
}

function columnLabel(key: TableColumnKey, draft: InvoiceDraft): string {
    switch (key) {
        case 'description':
            return 'Description';
        case 'hsn':
            return 'HSN/SAC';
        case 'qty':
            return 'Qty';
        case 'unit':
            return 'Unit';
        case 'hours':
            return 'Hours';
        case 'rate':
            return draft.invoice_type === 'timesheet' ? 'Rate/hr' : 'Unit price';
        case 'tax':
            return draft.tax_label || 'Tax %';
        case 'amount':
            return 'Amount';
        default:
            return key;
    }
}

function cellValue(
    key: TableColumnKey,
    item: InvoiceLineItem,
    line: number,
    draft: InvoiceDraft,
): string {
    switch (key) {
        case 'description':
            return item.description;
        case 'hsn':
            return item.unit && item.unit !== 'pcs' && item.unit !== 'hrs'
                ? item.unit
                : '—';
        case 'qty':
            return String(item.quantity);
        case 'unit':
            return item.unit ?? '—';
        case 'hours':
            return String(item.quantity);
        case 'rate':
            return formatMoney(item.unit_price, draft.currency);
        case 'tax':
            return item.tax_rate != null ? `${item.tax_rate}%` : '—';
        case 'amount':
            return formatMoney(line, draft.currency);
        default:
            return '';
    }
}

function ItemsTable({
    draft,
    columns,
    modern,
}: {
    draft: InvoiceDraft;
    columns: TableColumnKey[];
    modern: boolean;
}) {
    const headStyle = modern ? s.tableHeadModern : s.tableHead;
    const rowStyle = modern ? s.tableRowModern : s.tableRow;

    return (
        <>
            <View style={headStyle}>
                {columns.map((key) => (
                    <View key={key} style={colStyle(key, modern)}>
                        <Text>{columnLabel(key, draft)}</Text>
                    </View>
                ))}
            </View>
            {draft.document.items.map((item, index) => {
                const line =
                    Math.round(item.quantity * item.unit_price * 100) / 100;

                return (
                    <View key={index} style={rowStyle}>
                        {columns.map((key) => (
                            <View key={key} style={colStyle(key, modern)}>
                                <Text>{cellValue(key, item, line, draft)}</Text>
                            </View>
                        ))}
                    </View>
                );
            })}
        </>
    );
}

export function UnifiedInvoicePdf({
    draft,
    totals,
}: {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
}) {
    const cfg = buildFormatConfig(draft);
    const doc = draft.document;
    const modern = cfg.format === 'modern' || cfg.format === 'memo';

    const totalHours = doc.items.reduce((sum, i) => sum + i.quantity, 0);

    const headerNote = cfg.headerNote ? (
        <Text style={[s.muted, { marginBottom: 10 }]}>{cfg.headerNote}</Text>
    ) : null;

    const banner =
        cfg.showStatusBanner && cfg.bannerText ? (
            <View
                style={[
                    s.banner,
                    cfg.format === 'receipt' || draft.invoice_type === 'credit_memo'
                        ? s.bannerOk
                        : {},
                ]}
            >
                <Text
                    style={[
                        s.bannerText,
                        cfg.format === 'receipt' || draft.invoice_type === 'credit_memo'
                            ? s.bannerOkText
                            : {},
                    ]}
                >
                    {cfg.bannerText}
                </Text>
            </View>
        ) : null;

    const visibility = draft.field_visibility;

    const parties = (
        <View style={s.parties}>
            <PartyBlock
                title={cfg.sellerLabel}
                party={doc.seller}
                visibility={visibility}
                role="seller"
            />
            <PartyBlock
                title={cfg.buyerLabel}
                party={doc.buyer}
                visibility={visibility}
                role="buyer"
            />
        </View>
    );

    const items = (
        <ItemsTable draft={draft} columns={cfg.columns} modern={modern} />
    );

    const totalsBlock = (
        <View
            style={
                cfg.format === 'tax' ? { marginTop: 12 } : s.totalsWrap
            }
        >
            <TaxTotalsBlock
                draft={draft}
                totals={totals}
                boxStyle={
                    cfg.format === 'tax' ? s.totalBoxTax : s.totalBox
                }
                totalLabel={cfg.totalLabel}
            />
        </View>
    );

    const paymentBlock = (
        <PaymentBlockPdf draft={draft} totals={totals} />
    );

    const signatureBlock = <SignatureBlockPdf draft={draft} />;

    const footerNotes = (
        <View style={s.footer}>
            {isTermsAndConditionsVisible(visibility) &&
            doc.notes?.trim() ? (
                <View style={{ marginBottom: 4 }}>
                    <Text style={[s.muted, { fontWeight: 700 }]}>
                        Terms and conditions
                    </Text>
                    <Text style={s.muted}>{doc.notes}</Text>
                </View>
            ) : null}
            {cfg.footerDeclaration ? (
                <Text style={s.declaration}>{cfg.footerDeclaration}</Text>
            ) : null}
        </View>
    );

    if (cfg.format === 'tax') {
        return (
            <Document>
                <Page size="A4" style={s.page}>
                    <View style={s.content}>
                        {banner}
                        <View style={s.taxHeader}>
                            <Text style={s.taxTitle}>{cfg.title}</Text>
                            <Text style={[s.muted, { textAlign: 'center', marginTop: 4 }]}>
                                {cfg.numberLabel} {draft.invoice_number}
                            </Text>
                        </View>
                        {headerNote}
                        {isPartyFieldVisible(visibility, 'seller', 'tax_id') ||
                        isPartyFieldVisible(visibility, 'buyer', 'tax_id') ? (
                            <View style={s.taxIdRow}>
                                {isPartyFieldVisible(
                                    visibility,
                                    'seller',
                                    'tax_id',
                                ) ? (
                                    <View style={{ width: '48%' }}>
                                        <Text style={s.muted}>
                                            Supplier tax ID
                                        </Text>
                                        <Text style={{ fontWeight: 700 }}>
                                            {doc.seller.tax_id || '—'}
                                        </Text>
                                    </View>
                                ) : null}
                                {isPartyFieldVisible(
                                    visibility,
                                    'buyer',
                                    'tax_id',
                                ) ? (
                                    <View style={{ width: '48%' }}>
                                        <Text style={s.muted}>Buyer tax ID</Text>
                                        <Text style={{ fontWeight: 700 }}>
                                            {doc.buyer.tax_id || '—'}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        ) : null}
                        <Text style={[s.muted, { marginBottom: 8 }]}>
                            {invoiceDateDisplay(
                                draft.invoice_date,
                                draft.invoice_date_label,
                                draft.date_format,
                            )}
                            {draft.due_date ? ` · Due: ${draft.due_date}` : ''}
                        </Text>
                        {parties}
                        {items}
                        {totalsBlock}
                        {paymentBlock}
                        {footerNotes}
                        {signatureBlock}
                    </View>
                </Page>
            </Document>
        );
    }

    if (cfg.format === 'trade') {
        return (
            <Document>
                <Page size="A4" style={s.classicPage}>
                    {banner}
                    <View style={s.headerRow}>
                        <View>
                            {doc.logo_data_url &&
                            showPartyLogo(draft.field_visibility, 'seller') ? (
                                <Image
                                    src={doc.logo_data_url}
                                    style={{
                                        width: 100,
                                        height: 40,
                                        marginBottom: 8,
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : null}
                            <Text style={s.titleClassic}>{cfg.title}</Text>
                        </View>
                    </View>
                    <View style={s.tradeMeta}>
                        <View style={s.tradeMetaCell}>
                            <Text style={s.tradeMetaLabel}>Invoice number</Text>
                            <Text style={s.tradeMetaValue}>
                                {draft.invoice_number}
                            </Text>
                        </View>
                        <View style={s.tradeMetaCell}>
                            <Text style={s.tradeMetaLabel}>Date</Text>
                            <Text style={s.tradeMetaValue}>
                                {formatInvoiceDate(
                                    draft.invoice_date,
                                    draft.date_format,
                                )}
                            </Text>
                        </View>
                        <View style={s.tradeMetaCell}>
                            <Text style={s.tradeMetaLabel}>Currency</Text>
                            <Text style={s.tradeMetaValue}>INR (Rs.)</Text>
                        </View>
                        {isPartyFieldVisible(visibility, 'seller', 'address') ? (
                            <View style={s.tradeMetaCell}>
                                <Text style={s.tradeMetaLabel}>
                                    Country of origin
                                </Text>
                                <Text style={s.tradeMetaValue}>
                                    {doc.seller.country || '—'}
                                </Text>
                            </View>
                        ) : null}
                        <View style={s.tradeMetaCell}>
                            <Text style={s.tradeMetaLabel}>Terms of delivery</Text>
                            <Text style={s.tradeMetaValue}>As agreed</Text>
                        </View>
                    </View>
                    {headerNote}
                    {parties}
                    {items}
                    {totalsBlock}
                    {paymentBlock}
                    {footerNotes}
                    {signatureBlock}
                </Page>
            </Document>
        );
    }

    if (cfg.format === 'timesheet') {
        return (
            <Document>
                <Page size="A4" style={s.page}>
                    <View style={[s.bar, { backgroundColor: cfg.accent }]} />
                    <View style={s.content}>
                        <View style={s.headerRow}>
                            <View>
                                <Text style={s.title}>{cfg.title}</Text>
                                <Text style={s.muted}>
                                    {cfg.numberLabel} {draft.invoice_number}
                                </Text>
                                <Text style={s.muted}>
                                    Period:{' '}
                                    {formatInvoiceDate(
                                        draft.date_of_service ||
                                            draft.invoice_date,
                                        draft.date_format,
                                    )}
                                    {draft.due_date
                                        ? ` — Due ${draft.due_date}`
                                        : ''}
                                </Text>
                            </View>
                        </View>
                        {headerNote}
                        {parties}
                        {items}
                        <Text style={[s.muted, { marginTop: 8 }]}>
                            Total hours: {totalHours}
                        </Text>
                        {totalsBlock}
                        {paymentBlock}
                        {footerNotes}
                        {signatureBlock}
                    </View>
                </Page>
            </Document>
        );
    }

    if (cfg.format === 'receipt') {
        return (
            <Document>
                <Page size="A4" style={s.page}>
                    <View style={[s.bar, { backgroundColor: '#059669' }]} />
                    <View style={s.content}>
                        <Text style={s.receiptPaid}>PAID</Text>
                        {banner}
                        <Text style={s.title}>{cfg.title}</Text>
                        <Text style={s.muted}>
                            {cfg.numberLabel} {draft.invoice_number} ·{' '}
                            {formatInvoiceDate(
                                draft.invoice_date,
                                draft.date_format,
                            )}
                        </Text>
                        {parties}
                        {items}
                        {footerNotes}
                        {signatureBlock}
                    </View>
                </Page>
            </Document>
        );
    }

    if (cfg.format === 'classic') {
        return (
            <Document>
                <Page size="A4" style={s.classicPage}>
                    {banner}
                    <View style={s.headerRow}>
                        <View>
                            {doc.logo_data_url &&
                            showPartyLogo(draft.field_visibility, 'seller') ? (
                                <Image
                                    src={doc.logo_data_url}
                                    style={{
                                        width: 110,
                                        height: 44,
                                        marginBottom: 8,
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : null}
                            <Text style={s.titleClassic}>{cfg.title}</Text>
                            <Text style={s.muted}>
                                {cfg.numberLabel} {draft.invoice_number}
                            </Text>
                        </View>
                        <View style={s.amountBox}>
                            <Text>
                                {invoiceDateDisplay(
                                    draft.invoice_date,
                                    draft.invoice_date_label,
                                    draft.date_format,
                                )}
                            </Text>
                            {draft.due_date ? (
                                <Text>Due: {draft.due_date}</Text>
                            ) : null}
                        </View>
                    </View>
                    {headerNote}
                    {parties}
                    {items}
                    {totalsBlock}
                    {paymentBlock}
                    {footerNotes}
                    {signatureBlock}
                </Page>
            </Document>
        );
    }

    // modern + memo
    return (
        <Document>
            <Page size="A4" style={s.page}>
                <View style={[s.bar, { backgroundColor: cfg.accent }]} />
                <View style={s.content}>
                    {banner}
                    <View style={s.headerRow}>
                        <View style={{ maxWidth: '55%' }}>
                            {doc.logo_data_url &&
                            showPartyLogo(draft.field_visibility, 'seller') ? (
                                <Image
                                    src={doc.logo_data_url}
                                    style={{
                                        width: 100,
                                        height: 40,
                                        marginBottom: 10,
                                        objectFit: 'contain',
                                    }}
                                />
                            ) : null}
                            <Text style={s.title}>{cfg.title}</Text>
                            <Text style={s.muted}>
                                {cfg.numberLabel} {draft.invoice_number}
                            </Text>
                            <Text style={s.muted}>
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
                    </View>
                    {headerNote}
                    {parties}
                    {items}
                    {totalsBlock}
                    {paymentBlock}
                    {footerNotes}
                    {signatureBlock}
                </View>
            </Page>
        </Document>
    );
}
