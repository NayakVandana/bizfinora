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

    const toggle = showToggle && visibilityField ? (
        <VisibilityToggle
            label={label.toLowerCase()}
            field={visibilityField}
            visibility={visibility}
            onChange={onVisibilityChange}
            compact
        />
    ) : (
        <span className="text-[10px] text-gray-400">Always</span>
    );

    return (
        <div className="border-b border-gray-100 px-3 py-2.5 last:border-b-0 sm:grid sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-2 sm:py-2">
            <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-0 sm:block">
                <span className="text-xs font-medium text-gray-500">{label}</span>
                <div className="sm:hidden">{toggle}</div>
            </div>
            <div className="min-w-0 break-words text-sm">{display}</div>
            <div className="mt-1.5 hidden justify-end sm:mt-0 sm:flex">{toggle}</div>
        </div>
    );
}
