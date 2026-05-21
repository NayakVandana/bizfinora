import { StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PartyDetails } from '../types';

export const baseStyles = StyleSheet.create({
    page: {
        padding: 32,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#111827',
    },
    h1: { fontSize: 22, fontWeight: 700, marginBottom: 4 },
    muted: { color: '#6b7280', fontSize: 9 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    section: { marginBottom: 16 },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 8,
        fontWeight: 700,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        padding: 8,
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'right' },
    colPrice: { width: '17%', textAlign: 'right' },
    colTotal: { width: '18%', textAlign: 'right' },
});

export function PartyBlock({
    title,
    party,
}: {
    title: string;
    party: PartyDetails;
}) {
    const addressBlock = party.address
        ? party.address.split('\n')
        : [
              party.address_line1,
              party.address_line2,
              [party.city, party.state, party.postal_code]
                  .filter(Boolean)
                  .join(', '),
              party.country,
          ].filter(Boolean);

    const lines = [
        ...addressBlock,
        party.email,
        party.phone,
        party.tax_id
            ? `${party.tax_id_label ?? 'Tax ID'}: ${party.tax_id}`
            : null,
        party.account_number ? `Account: ${party.account_number}` : null,
        party.swift_bic ? `SWIFT: ${party.swift_bic}` : null,
        party.notes,
    ].filter(Boolean);

    return (
        <View style={{ width: '48%' }}>
            <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 4 }}>
                {title}
            </Text>
            <Text style={{ fontWeight: 700, marginBottom: 4 }}>{party.name}</Text>
            {lines.map((line, i) => (
                <Text key={i} style={{ fontSize: 9, color: '#374151' }}>
                    {line}
                </Text>
            ))}
        </View>
    );
}
