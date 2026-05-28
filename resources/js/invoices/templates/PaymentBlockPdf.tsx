import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import { amountInWords } from '../amountInWords';
import { formatMoney } from '../formatMoney';
import {
    isAnyPaymentSectionVisible,
    isPaymentBankVisible,
    isPaymentQrVisible,
    isPaymentTermsVisible,
    paymentFromDraft,
} from '../paymentTypes';
import type { InvoiceDraft, InvoiceTotals } from '../types';

const text = '#111827';
const body = '#374151';
const muted = '#6b7280';
const border = '#e5e7eb';
const headBg = '#f3f4f6';

const s = StyleSheet.create({
    wrap: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    sectionHead: {
        backgroundColor: headBg,
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    sectionTitle: {
        fontSize: 8,
        fontWeight: 700,
        color: text,
        textAlign: 'center',
        letterSpacing: 0.4,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderColor: '#f3f4f6',
    },
    label: {
        width: '38%',
        fontSize: 8,
        fontWeight: 700,
        color: text,
    },
    value: { width: '62%', fontSize: 8, color: body },
    divider: {
        borderTopWidth: 1,
        borderColor: border,
    },
    qrSection: {
        paddingVertical: 6,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    qrTitle: {
        fontSize: 8,
        fontWeight: 700,
        color: text,
        marginBottom: 4,
        letterSpacing: 0.4,
        textAlign: 'center',
    },
    qrImage: { width: 88, height: 88 },
    qrHint: { fontSize: 7, color: muted, marginTop: 3 },
    amountLine: {
        fontSize: 8,
        fontWeight: 700,
        color: text,
        marginTop: 2,
    },
    noteBar: {
        backgroundColor: headBg,
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    noteText: { fontSize: 7, color: body, lineHeight: 1.35 },
    block: {
        paddingVertical: 5,
        paddingHorizontal: 8,
    },
    blockLabel: {
        fontSize: 8,
        fontWeight: 700,
        color: text,
        marginBottom: 2,
    },
    blockText: { fontSize: 8, color: body, lineHeight: 1.35 },
    words: {
        fontSize: 8,
        fontWeight: 700,
        color: text,
        marginTop: 4,
        lineHeight: 1.35,
    },
});

type Props = {
    draft: InvoiceDraft;
    totals: InvoiceTotals;
};

export function PaymentBlockPdf({ draft, totals }: Props) {
    const visibility = draft.field_visibility;
    const payment = paymentFromDraft(draft);
    const doc = draft.document;
    const paymentTermsText = doc.payment_terms?.trim() ?? '';
    const paymentTermsVisible = isPaymentTermsVisible(visibility);
    const showPaymentTerms =
        paymentTermsVisible && Boolean(paymentTermsText);
    const showBankSection = isPaymentBankVisible(visibility);
    const showQrSection =
        isPaymentQrVisible(visibility) && Boolean(doc.qr_data_url);

    if (!isAnyPaymentSectionVisible(visibility)) {
        return null;
    }

    const rows: { key: string; label: string; value: string }[] = [];

    if (showBankSection) {
        if (payment.account_number) {
            rows.push({
                key: 'acct',
                label: 'Account Number',
                value: payment.account_number,
            });
        }
        if (payment.account_type) {
            rows.push({
                key: 'type',
                label: 'Account Type',
                value: payment.account_type,
            });
        }
        if (payment.account_holder) {
            rows.push({
                key: 'holder',
                label: 'Account Holder',
                value: payment.account_holder,
            });
        }
        if (payment.upi_id) {
            rows.push({
                key: 'upi',
                label: 'UPI ID',
                value: payment.upi_id,
            });
        }
        if (payment.branch_ifsc) {
            rows.push({
                key: 'ifsc',
                label: 'Branch IFSC',
                value: payment.branch_ifsc,
            });
        }
        if (payment.branch_name) {
            rows.push({
                key: 'branch',
                label: 'Branch Name',
                value: payment.branch_name,
            });
        }
    }

    const showNote =
        paymentTermsVisible && Boolean(payment.note?.trim());
    const showBankBlock = showBankSection && rows.length > 0;
    const showCard =
        showBankBlock || showQrSection || showPaymentTerms || showNote;
    const showAmountInWords =
        showBankBlock || showQrSection || showPaymentTerms || showNote;

    if (!showCard) {
        return null;
    }

    const amountWordsLine = showAmountInWords
        ? `Amount (in words): ${amountInWords(totals.total, draft.currency)}`
        : null;

    return (
        <View style={s.wrap}>
            {showBankBlock && rows.length > 0 ? (
                <>
                    <View style={s.sectionHead}>
                        <Text style={s.sectionTitle}>
                            BANK DETAILS FOR PAYMENT
                        </Text>
                    </View>
                    {rows.map((row, index) => (
                        <View
                            key={row.key}
                            style={[
                                s.row,
                                index === rows.length - 1 && !showQrSection && !showNote
                                    ? { borderBottomWidth: 0 }
                                    : {},
                            ]}
                        >
                            <Text style={s.label}>{row.label}</Text>
                            <Text style={s.value}>{row.value}</Text>
                        </View>
                    ))}
                </>
            ) : null}

            {showQrSection ? (
                <View style={[s.qrSection, showBankBlock ? s.divider : {}]}>
                    <Text style={s.qrTitle}>SCAN QR CODE TO PAY</Text>
                    <Image src={doc.qr_data_url!} style={s.qrImage} />
                    <Text style={s.qrHint}>Scan with UPI app</Text>
                    <Text style={s.amountLine}>
                        Amount: {formatMoney(totals.total, draft.currency)}
                    </Text>
                </View>
            ) : null}

            {showNote ? (
                <View style={[s.noteBar, showBankBlock || showQrSection ? s.divider : {}]}>
                    <Text style={s.noteText}>
                        <Text style={{ fontWeight: 700 }}>Note: </Text>
                        {payment.note}
                    </Text>
                </View>
            ) : null}

            {showPaymentTerms ? (
                <View
                    style={[
                        s.block,
                        showBankBlock || showQrSection || showNote
                            ? s.divider
                            : {},
                    ]}
                >
                    <Text style={s.blockLabel}>PAYMENT TERMS</Text>
                    <Text style={s.blockText}>{paymentTermsText}</Text>
                    {amountWordsLine ? (
                        <Text style={s.words}>{amountWordsLine}</Text>
                    ) : null}
                </View>
            ) : amountWordsLine ? (
                <View
                    style={[
                        s.block,
                        showBankBlock || showQrSection || showNote
                            ? s.divider
                            : {},
                    ]}
                >
                    <Text style={s.words}>{amountWordsLine}</Text>
                </View>
            ) : null}
        </View>
    );
}
