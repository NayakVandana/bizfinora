import { isFieldVisible } from './fieldVisibility';
import type { FieldVisibility, PartyDetails } from './types';

export type PartyVisibilityRole = 'seller' | 'buyer';

function prefix(role: PartyVisibilityRole, field: string): string {
    return role === 'seller' ? `seller_${field}` : `buyer_${field}`;
}

export function partyDetailLines(
    party: PartyDetails,
    visibility: FieldVisibility | undefined,
    role: PartyVisibilityRole = 'seller',
): string[] {
    const lines: string[] = [];

    if (
        role === 'buyer' &&
        party.name?.trim() &&
        isFieldVisible(visibility, prefix(role, 'owner_name'), true)
    ) {
        lines.push(`Owner: ${party.name.trim()}`);
    }

    const address =
        party.address?.trim() ||
        [
            party.address_line1,
            party.address_line2,
            [party.city, party.state, party.postal_code]
                .filter(Boolean)
                .join(', '),
            party.country,
        ]
            .filter(Boolean)
            .join(', ');

    if (
        address &&
        isFieldVisible(visibility, prefix(role, 'address'), true)
    ) {
        address.split('\n').forEach((line) => {
            if (line.trim()) {
                lines.push(line.trim());
            }
        });
    }

    if (
        party.gst?.trim() &&
        isFieldVisible(visibility, prefix(role, 'gst'), true)
    ) {
        lines.push(`GSTIN: ${party.gst.trim()}`);
    } else if (
        party.tax_id?.trim() &&
        isFieldVisible(visibility, prefix(role, 'tax_id'), true)
    ) {
        const label = party.tax_id_label?.trim() || 'Tax ID';
        lines.push(`${label}: ${party.tax_id.trim()}`);
    }

    if (
        party.pan?.trim() &&
        isFieldVisible(visibility, prefix(role, 'pan'), true)
    ) {
        lines.push(`PAN: ${party.pan.trim()}`);
    }

    if (
        party.email?.trim() &&
        isFieldVisible(visibility, prefix(role, 'email'), true)
    ) {
        lines.push(party.email.trim());
    }

    if (
        party.phone?.trim() &&
        isFieldVisible(visibility, prefix(role, 'phone'), true)
    ) {
        lines.push(party.phone.trim());
    }

    if (isFieldVisible(visibility, prefix(role, 'bank'), true)) {
        if (party.account_number?.trim()) {
            lines.push(`Account: ${party.account_number.trim()}`);
        }
        if (party.swift_bic?.trim()) {
            lines.push(`SWIFT/BIC: ${party.swift_bic.trim()}`);
        }
    }

    if (
        party.notes?.trim() &&
        isFieldVisible(visibility, prefix(role, 'notes'), false)
    ) {
        party.notes
            .trim()
            .split('\n')
            .forEach((line) => {
                if (line.trim()) {
                    lines.push(line.trim());
                }
            });
    }

    return lines;
}

export function showPartyLogo(
    visibility: FieldVisibility | undefined,
    role: PartyVisibilityRole = 'seller',
): boolean {
    return isFieldVisible(visibility, prefix(role, 'logo'), true);
}

export function isPartyFieldVisible(
    visibility: FieldVisibility | undefined,
    role: PartyVisibilityRole,
    field: string,
    defaultVisible = true,
): boolean {
    return isFieldVisible(visibility, prefix(role, field), defaultVisible);
}
