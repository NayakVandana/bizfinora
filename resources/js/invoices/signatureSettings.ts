export const SIGNATURE_VISIBILITY = 'authorized_signature';

export type CompanySignatureSettings = {
    default_show_authorized_signature_on_invoice?: boolean;
};

export function isAuthorizedSignatureVisible(
    visibility: Record<string, boolean> | undefined,
): boolean {
    if (visibility && SIGNATURE_VISIBILITY in visibility) {
        return Boolean(visibility[SIGNATURE_VISIBILITY]);
    }

    return true;
}

export function mergeSignatureVisibilityIntoDraft<
    T extends { field_visibility?: Record<string, boolean> },
>(
    draft: T,
    visibility?: Record<string, boolean> | null,
    settings?: CompanySignatureSettings | null,
): T {
    const show =
        visibility && SIGNATURE_VISIBILITY in visibility
            ? Boolean(visibility[SIGNATURE_VISIBILITY])
            : (settings?.default_show_authorized_signature_on_invoice ?? true);

    return {
        ...draft,
        field_visibility: {
            ...(draft.field_visibility ?? {}),
            [SIGNATURE_VISIBILITY]: show,
        },
    };
}
