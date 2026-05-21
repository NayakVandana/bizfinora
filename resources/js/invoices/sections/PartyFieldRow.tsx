import VisibilityToggle from './VisibilityToggle';
import type { ReactNode } from 'react';

type Props = {
    label: string;
    value?: string | null;
    visibilityField?: string;
    visibility: Record<string, boolean>;
    onVisibilityChange: (field: string, visible: boolean) => void;
    showToggle?: boolean;
    children?: ReactNode;
};

export default function PartyFieldRow({
    label,
    value,
    visibilityField,
    visibility,
    onVisibilityChange,
    showToggle = true,
    children,
}: Props) {
    const display = children ?? (
        <span
            className={
                value?.trim()
                    ? 'text-sm text-gray-900'
                    : 'text-sm text-gray-400'
            }
        >
            {value?.trim() || '—'}
        </span>
    );

    return (
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0 px-3 py-2 sm:grid-cols-[6rem_minmax(0,1fr)_auto]">
            <span className="text-xs font-medium text-gray-500">{label}</span>
            <div className="min-w-0 truncate">{display}</div>
            <div className="flex justify-end">
                {showToggle && visibilityField ? (
                    <VisibilityToggle
                        label={label.toLowerCase()}
                        field={visibilityField}
                        visibility={visibility}
                        onChange={onVisibilityChange}
                        compact
                    />
                ) : (
                    <span className="text-[10px] text-gray-400">Always</span>
                )}
            </div>
        </div>
    );
}
