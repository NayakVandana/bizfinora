import { StyleSheet, Text, View } from '@react-pdf/renderer';
import { isAuthorizedSignatureVisible } from '../signatureSettings';
import type { InvoiceDraft } from '../types';

const s = StyleSheet.create({
    wrap: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    block: {
        width: 220,
        alignItems: 'center',
    },
    line: {
        width: '100%',
        borderTopWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 8,
    },
    label: {
        fontSize: 9,
        fontWeight: 700,
        color: '#374151',
        textAlign: 'center',
        marginBottom: 4,
    },
    company: {
        fontSize: 8,
        fontWeight: 700,
        color: '#111827',
        textAlign: 'center',
    },
});

type Props = {
    draft: InvoiceDraft;
};

export function SignatureBlockPdf({ draft }: Props) {
    if (!isAuthorizedSignatureVisible(draft.field_visibility)) {
        return null;
    }

    const companyName = draft.document.seller.name?.trim() ?? '';

    return (
        <View style={s.wrap}>
            <View style={s.block}>
                <View style={s.line} />
                <Text style={s.label}>Authorised Signature</Text>
                {companyName ? (
                    <Text style={s.company}>
                        For {companyName.toUpperCase()}
                    </Text>
                ) : null}
            </View>
        </View>
    );
}
