type Props = {
    label: string;
    field: string;
    visibility: Record<string, boolean>;
    onChange: (field: string, visible: boolean) => void;
    /** Shorter label for dense layouts (e.g. seller table rows). */
    compact?: boolean;
};

export default function VisibilityToggle({
    label,
    field,
    visibility,
    onChange,
    compact = false,
}: Props) {
    const checked = visibility[field] !== false;

    if (compact) {
        return (
            <label
                className="flex cursor-pointer items-center gap-1 text-[11px] text-muted-foreground"
                title={`Show ${label} on PDF`}
            >
                <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-input text-sidebar-primary focus:ring-ring"
                    checked={checked}
                    onChange={(e) => onChange(field, e.target.checked)}
                />
                <span>PDF</span>
            </label>
        );
    }

    return (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
                type="checkbox"
                className="rounded border-input text-sidebar-primary focus:ring-ring"
                checked={checked}
                onChange={(e) => onChange(field, e.target.checked)}
            />
            Show {label} on PDF
        </label>
    );
}
