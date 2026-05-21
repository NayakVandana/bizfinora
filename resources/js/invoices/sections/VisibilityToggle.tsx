type Props = {
    label: string;
    field: string;
    visibility: Record<string, boolean>;
    onChange: (field: string, visible: boolean) => void;
};

export default function VisibilityToggle({
    label,
    field,
    visibility,
    onChange,
}: Props) {
    const checked = visibility[field] !== false;

    return (
        <label className="flex items-center gap-2 text-xs text-gray-600">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(field, e.target.checked)}
            />
            Show {label} on PDF
        </label>
    );
}
