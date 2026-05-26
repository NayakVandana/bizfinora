import {
    displayText,
    filterNonemptyFields,
    formatAdminDate,
    type AdminDetailField,
} from '@/utils/adminDetailFormat';

export type AdminDetailGroup = {
    title: string;
    fields: AdminDetailField[];
    logoUrl?: string | null;
};

function CompactField({ field }: { field: AdminDetailField }) {
    const text = displayText(field.value);
    const empty = text === '—';

    return (
        <div
            className={`text-sm sm:flex sm:gap-3 ${
                field.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''
            }`}
        >
            <dt className="text-muted-foreground shrink-0 sm:w-36 lg:w-40">
                {field.label}
            </dt>
            <dd
                className={`min-w-0 flex-1 ${
                    field.multiline ? 'whitespace-pre-wrap break-words' : 'truncate'
                } ${empty ? 'text-muted-foreground' : 'text-foreground'}`}
            >
                {text}
            </dd>
        </div>
    );
}

function DetailGroupBlock({ group }: { group: AdminDetailGroup }) {
    const fields = filterNonemptyFields(group.fields);
    const hasLogo = Boolean(group.logoUrl);

    if (fields.length === 0 && !hasLogo) {
        return null;
    }

    return (
        <section className="px-4 py-3">
            <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                {group.title}
            </h3>
            {hasLogo ? (
                <img
                    src={group.logoUrl!}
                    alt="Company logo"
                    className="mb-2 h-10 max-w-[8rem] object-contain"
                />
            ) : null}
            <dl className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => (
                    <CompactField key={field.label} field={field} />
                ))}
            </dl>
        </section>
    );
}

type Props = {
    groups: AdminDetailGroup[];
    title?: string;
};

export default function AdminDetailPanel({ groups, title }: Props) {
    const visibleGroups = groups.filter((group) => {
        const fields = filterNonemptyFields(group.fields);

        return fields.length > 0 || Boolean(group.logoUrl);
    });

    if (visibleGroups.length === 0) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            {title ? (
                <div className="border-b border-border px-4 py-2.5">
                    <p className="text-foreground text-sm font-medium">{title}</p>
                </div>
            ) : null}
            <div className="divide-y divide-border">
                {visibleGroups.map((group) => (
                    <DetailGroupBlock key={group.title} group={group} />
                ))}
            </div>
        </div>
    );
}

export function adminTextField(
    label: string,
    value?: string | number | null,
    options?: { multiline?: boolean; fullWidth?: boolean },
): AdminDetailField {
    return {
        label,
        value: value ?? null,
        multiline: options?.multiline,
        fullWidth: options?.fullWidth,
    };
}

export function adminBoolField(
    label: string,
    value?: boolean | null,
): AdminDetailField {
    return { label, value: value ?? null };
}

export function adminDateField(
    label: string,
    value?: string | null,
): AdminDetailField {
    return { label, value: formatAdminDate(value) };
}
