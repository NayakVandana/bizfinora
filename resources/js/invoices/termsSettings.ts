export const TERMS_VISIBILITY = 'terms_and_conditions';

export type CompanyTermsSettings = {
    default_terms_and_conditions?: string | null;
    default_show_terms_on_invoice?: boolean;
};

export function isTermsAndConditionsVisible(
    visibility: Record<string, boolean> | undefined,
): boolean {
    if (visibility && TERMS_VISIBILITY in visibility) {
        return Boolean(visibility[TERMS_VISIBILITY]);
    }

    return true;
}

export function mergeTermsVisibilityIntoDraft<
    T extends { field_visibility?: Record<string, boolean> },
>(
    draft: T,
    visibility?: Record<string, boolean> | null,
    settings?: CompanyTermsSettings | null,
): T {
    const show =
        visibility && TERMS_VISIBILITY in visibility
            ? Boolean(visibility[TERMS_VISIBILITY])
            : (settings?.default_show_terms_on_invoice ?? true);

    return {
        ...draft,
        field_visibility: {
            ...(draft.field_visibility ?? {}),
            [TERMS_VISIBILITY]: show,
        },
    };
}

/** Always overlay company terms (document notes) from settings. */
export function mergeTermsAndConditionsIntoDraft<
    T extends { document: { notes?: string } },
>(draft: T, companyTerms?: string | null): T {
    return {
        ...draft,
        document: {
            ...draft.document,
            notes: companyTerms?.trim() ?? '',
        },
    };
}

export function applyCompanyTermsToDraft<
    T extends {
        document: { notes?: string };
        field_visibility?: Record<string, boolean>;
    },
>(
    draft: T,
    settings?: CompanyTermsSettings | null,
    visibility?: Record<string, boolean> | null,
): T {
    const withText = mergeTermsAndConditionsIntoDraft(
        draft,
        settings?.default_terms_and_conditions,
    );

    return mergeTermsVisibilityIntoDraft(withText, visibility, settings);
}
