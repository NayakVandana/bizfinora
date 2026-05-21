export function isFieldVisible(
    visibility: Record<string, boolean> | undefined,
    field: string,
    defaultVisible = true,
): boolean {
    if (!visibility || visibility[field] === undefined) {
        return defaultVisible;
    }

    return visibility[field] !== false;
}
