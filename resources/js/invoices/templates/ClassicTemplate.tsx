import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { invoiceDateDisplay } from '../formatInvoiceDate';
import { showPartyLogo } from '../partyPdfLines';
import { formatMoney } from '../formatMoney';
import type { InvoiceDraft, InvoiceTotals } from '../types';
import { baseStyles, PartyBlock } from './shared';
import { TaxTotalsBlock } from './TaxTotalsBlock';
import { documentTitleForDraft } from './invoiceTypePresentation';

export function ClassicTemplate({
    draft,
    totals,
}: {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
}) {
    const { document: doc } = draft;
    const title = documentTitleForDraft(draft.invoice_type ?? 'standard');

    return (
        <Document>
            <Page size="A4" style={baseStyles.page}>
                <View style={baseStyles.row}>
                    <View>
                        {doc.logo_data_url &&
                        showPartyLogo(draft.field_visibility, 'seller') ? (
                            <Image
                                src={doc.logo_data_url}
                                style={{ width: 120, height: 48, objectFit: 'contain', marginBottom: 8 }}
                            />
                        ) : null}
                        <Text style={baseStyles.h1}>{title}</Text>
                        <Text style={baseStyles.muted}>#{draft.invoice_number}</Text>
                    </View>
                    <View style={{ textAlign: 'right' }}>
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

                <View style={[baseStyles.row, baseStyles.section, { marginTop: 20 }]}>
                    <PartyBlock
                        title="From (Seller)"
                        party={doc.seller}
                        visibility={draft.field_visibility}
                        role="seller"
                    />
                    <PartyBlock
                        title="Bill to (Buyer)"
                        party={doc.buyer}
                        visibility={draft.field_visibility}
                        role="buyer"
                    />
                </View>

                <View style={baseStyles.tableHeader}>
                    <Text style={baseStyles.colDesc}>Description</Text>
                    <Text style={baseStyles.colQty}>Qty</Text>
                    <Text style={baseStyles.colPrice}>Rate</Text>
                    <Text style={baseStyles.colTotal}>Amount</Text>
                </View>

                {doc.items.map((item, index) => {
                    const line =
                        Math.round(item.quantity * item.unit_price * 100) / 100;

                    return (
                        <View key={index} style={baseStyles.tableRow}>
                            <Text style={baseStyles.colDesc}>{item.description}</Text>
                            <Text style={baseStyles.colQty}>{item.quantity}</Text>
                            <Text style={baseStyles.colPrice}>
                                {formatMoney(item.unit_price, draft.currency)}
                            </Text>
                            <Text style={baseStyles.colTotal}>
                                {formatMoney(line, draft.currency)}
                            </Text>
                        </View>
                    );
                })}

                <View style={{ marginTop: 16, alignItems: 'flex-end', width: '100%' }}>
                    <View style={{ width: 240 }}>
                        <TaxTotalsBlock draft={draft} totals={totals} />
                    </View>
                </View>

                <View style={[baseStyles.row, { marginTop: 24 }]}>
                    <View style={{ flex: 1 }}>
                        {doc.notes ? (
                            <>
                                <Text style={{ fontWeight: 700, marginBottom: 4 }}>Notes</Text>
                                <Text style={baseStyles.muted}>{doc.notes}</Text>
                            </>
                        ) : null}
                        {doc.payment_terms ? (
                            <>
                                <Text style={{ fontWeight: 700, marginTop: 8, marginBottom: 4 }}>
                                    Payment terms
                                </Text>
                                <Text style={baseStyles.muted}>{doc.payment_terms}</Text>
                            </>
                        ) : null}
                    </View>
                    {doc.qr_data_url ? (
                        <Image src={doc.qr_data_url} style={{ width: 80, height: 80 }} />
                    ) : null}
                </View>
            </Page>
        </Document>
    );
}
