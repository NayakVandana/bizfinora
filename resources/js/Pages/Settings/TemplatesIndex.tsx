import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TemplateLibraryCard from '@/Components/TemplateLibraryCard';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InvoicePreview from '@/invoices/InvoicePreview';
import { buildTemplatePreviewDraft } from '@/invoices/buildTemplatePreviewDraft';
import {
    cloneCustomTemplate,
    cloneSystemTemplate,
    deleteCustomTemplate,
    fetchTemplatesList,
    setDefaultTemplate,
    type CustomTemplateRow,
    type SystemTemplateRow,
    type TemplatesListData,
} from '@/invoices/customTemplatesApi';
import { downloadInvoicePdf } from '@/invoices/downloadPdf';
import { invoiceTypeLabel } from '@/invoices/invoiceTypes';
import { applyTemplatePresetToDraft } from '@/invoices/templatePresets';
import { Head, router } from '@inertiajs/react';
import { useConfirm } from '@/contexts/ConfirmDialogContext';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTemplatePreviewData } from './useTemplatePreviewData';

const TEMPLATES_FLASH_KEY = 'templates_flash_message';

type PreviewTarget =
    | { kind: 'system'; id: string; name: string; layout: string }
    | { kind: 'custom'; row: CustomTemplateRow };

type TabId = 'all' | 'default' | 'general' | 'custom';

const TABS: { id: TabId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'default', label: 'Default' },
    { id: 'general', label: 'General' },
    { id: 'custom', label: 'Custom' },
];

function resolveDefaultTarget(
    data: TemplatesListData | null,
): PreviewTarget | null {
    if (!data) {
        return null;
    }

    if (data.default_custom_template_id != null) {
        const row = data.custom.find(
            (r) => r.id === data.default_custom_template_id,
        );
        if (row) {
            return { kind: 'custom', row };
        }
        return null;
    }

    const typeId = data.default_invoice_type ?? 'standard';
    const row = data.system.find((r) => r.id === typeId);
    if (!row) {
        return null;
    }

    return {
        kind: 'system',
        id: row.id,
        name: row.name,
        layout: row.layout,
    };
}

function cardKey(target: PreviewTarget): string {
    return target.kind === 'system'
        ? `sys-${target.id}`
        : `custom-${target.row.id}`;
}

export default function TemplatesIndex() {
    const { confirm } = useConfirm();
    const { seller, taxSettings, loading: previewDataLoading } =
        useTemplatePreviewData();
    const [data, setData] = useState<TemplatesListData | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState<TabId>('all');
    const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(
        null,
    );
    const [downloading, setDownloading] = useState(false);

    const reload = useCallback(async () => {
        const res = await fetchTemplatesList();
        if (res.success && res.data) {
            setData(res.data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    useEffect(() => {
        const flash = sessionStorage.getItem(TEMPLATES_FLASH_KEY);
        if (flash) {
            setMessage(flash);
            sessionStorage.removeItem(TEMPLATES_FLASH_KEY);
        }
    }, []);

    const q = filter.trim().toLowerCase();
    const systemRows =
        data?.system.filter(
            (r) =>
                !q ||
                r.name.toLowerCase().includes(q) ||
                r.description.toLowerCase().includes(q),
        ) ?? [];
    const customRows =
        data?.custom.filter(
            (r) =>
                !q ||
                r.name.toLowerCase().includes(q) ||
                (r.description ?? '').toLowerCase().includes(q),
        ) ?? [];

    const defaultTarget = useMemo(
        () => resolveDefaultTarget(data),
        [data],
    );

    const tabCounts: Record<TabId, number> = {
        all: systemRows.length + customRows.length,
        default: defaultTarget ? 1 : 0,
        general: systemRows.length,
        custom: customRows.length,
    };

    const visibleCards = useMemo((): PreviewTarget[] => {
        if (activeTab === 'default') {
            return defaultTarget ? [defaultTarget] : [];
        }

        const cards: PreviewTarget[] = [];

        if (activeTab === 'all' || activeTab === 'general') {
            for (const row of systemRows) {
                cards.push({
                    kind: 'system',
                    id: row.id,
                    name: row.name,
                    layout: row.layout,
                });
            }
        }

        if (activeTab === 'all' || activeTab === 'custom') {
            for (const row of customRows) {
                cards.push({ kind: 'custom', row });
            }
        }

        return cards;
    }, [activeTab, systemRows, customRows, defaultTarget]);

    useEffect(() => {
        if (visibleCards.length === 0) {
            setPreviewTarget(null);
            return;
        }

        if (
            previewTarget &&
            visibleCards.some((c) => cardKey(c) === cardKey(previewTarget))
        ) {
            return;
        }

        setPreviewTarget(visibleCards[0]);
    }, [visibleCards, previewTarget]);

    const previewDraft = useMemo(() => {
        if (!seller || !previewTarget) {
            return null;
        }

        if (previewTarget.kind === 'system') {
            return buildTemplatePreviewDraft(
                seller,
                previewTarget.id,
                taxSettings,
            );
        }

        const base = buildTemplatePreviewDraft(
            seller,
            previewTarget.row.base_invoice_type,
            taxSettings,
        );
        return applyTemplatePresetToDraft(base, previewTarget.row.preset ?? {});
    }, [seller, taxSettings, previewTarget]);

    const previewTitle =
        previewTarget?.kind === 'system'
            ? previewTarget.name
            : previewTarget?.row.name;

    const isDefaultSystem = (typeId: string) =>
        data?.default_custom_template_id == null &&
        (data?.default_invoice_type ?? 'standard') === typeId;

    const isDefaultCustom = (id: number) =>
        data?.default_custom_template_id === id;

    const isSelectedDefault =
        previewTarget?.kind === 'system'
            ? isDefaultSystem(previewTarget.id)
            : previewTarget?.kind === 'custom'
              ? isDefaultCustom(previewTarget.row.id)
              : false;

    const handleCloneSystem = async (row: SystemTemplateRow) => {
        setBusyId(`sys-${row.id}`);
        setMessage(null);
        try {
            const res = await cloneSystemTemplate(row.id);
            if (res.success && res.data) {
                router.visit(
                    route('settings.templates.edit', res.data.id),
                );
                return;
            }
            setMessage(res.message ?? 'Clone failed.');
        } finally {
            setBusyId(null);
        }
    };

    const handleCloneCustom = async (row: CustomTemplateRow) => {
        setBusyId(`custom-${row.id}`);
        setMessage(null);
        try {
            const res = await cloneCustomTemplate(row.id);
            if (res.success && res.data) {
                router.visit(
                    route('settings.templates.edit', res.data.id),
                );
                return;
            }
            setMessage(res.message ?? 'Clone failed.');
        } finally {
            setBusyId(null);
        }
    };

    const handleSetDefaultFor = async (target: PreviewTarget) => {
        if (target.kind === 'system') {
            setBusyId(`def-sys-${target.id}`);
            setMessage(null);
            try {
                const res = await setDefaultTemplate({
                    systemType: target.id,
                });
                if (res.success) {
                    setMessage('Default template updated.');
                    setPreviewTarget(target);
                    await reload();
                } else {
                    setMessage(res.message ?? 'Failed.');
                }
            } finally {
                setBusyId(null);
            }
            return;
        }

        setBusyId(`def-custom-${target.row.id}`);
        setMessage(null);
        try {
            const res = await setDefaultTemplate({
                customTemplateId: target.row.id,
            });
            if (res.success) {
                setMessage('Default template updated.');
                setPreviewTarget(target);
                await reload();
            } else {
                setMessage(res.message ?? 'Failed.');
            }
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (row: CustomTemplateRow) => {
        const ok = await confirm({
            title: 'Remove template?',
            message: `Remove template “${row.name}”? This cannot be undone.`,
            confirmLabel: 'Remove',
            variant: 'danger',
        });

        if (!ok) {
            return;
        }

        setBusyId(`del-${row.id}`);
        setMessage(null);
        try {
            const res = await deleteCustomTemplate(row.id);
            setMessage(
                res.success
                    ? 'Template removed.'
                    : (res.message ?? 'Remove failed.'),
            );
            if (res.success) {
                await reload();
            }
        } finally {
            setBusyId(null);
        }
    };

    const handleStartBlank = async () => {
        setBusyId('blank');
        setMessage(null);
        try {
            const res = await cloneSystemTemplate('standard', 'Blank template');
            if (res.success && res.data) {
                router.visit(
                    route('settings.templates.edit', res.data.id),
                );
                return;
            }
            setMessage(res.message ?? 'Could not create blank template.');
        } finally {
            setBusyId(null);
        }
    };

    const pageLoading = loading || previewDataLoading;

    const renderCard = (target: PreviewTarget) => {
        const selected =
            previewTarget !== null &&
            cardKey(target) === cardKey(previewTarget);
        const isSystem = target.kind === 'system';
        const layout = isSystem ? target.layout : target.row.layout;
        const name = isSystem ? target.name : target.row.name;
        const isDefault = isSystem
            ? isDefaultSystem(target.id)
            : isDefaultCustom(target.row.id);
        const kind = isSystem ? 'general' : 'custom';

        return (
            <TemplateLibraryCard
                key={cardKey(target)}
                name={name}
                layout={layout}
                kind={kind}
                isDefault={isDefault}
                selected={selected}
                onSelect={() => setPreviewTarget(target)}
            />
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-foreground text-xl font-semibold">
                            Select template
                        </h2>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                            Browse, preview, and set your default invoice
                            template
                        </p>
                    </div>
                    <SecondaryButton
                        type="button"
                        disabled={busyId === 'blank'}
                        onClick={() => void handleStartBlank()}
                        className="normal-case tracking-normal"
                    >
                        {busyId === 'blank' ? 'Creating…' : 'Start with blank'}
                    </SecondaryButton>
                </div>
            }
        >
            <Head title="Templates" />

            <div className="flex h-[calc(100svh-3.5rem)] flex-col overflow-hidden px-3 py-3 sm:px-6 lg:px-8">
                {message ? (
                    <div className="mb-3 flex shrink-0 items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
                        <span>{message}</span>
                        <button
                            type="button"
                            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
                            onClick={() => setMessage(null)}
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ) : null}

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
                        <aside className="flex max-h-[40vh] min-h-0 shrink-0 flex-col border-b border-border bg-muted/30 lg:max-h-none lg:w-[19rem] lg:border-b-0 lg:border-r xl:w-[21rem]">
                            <div className="shrink-0 border-b border-border bg-card/80 p-4 backdrop-blur-sm">
                                    <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
                                        {TABS.map((tab) => {
                                            const tabSelected =
                                                activeTab === tab.id;

                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setActiveTab(tab.id)
                                                    }
                                                    className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition ${
                                                        tabSelected
                                                            ? 'bg-background text-foreground shadow-sm'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    {tab.label}
                                                    <span className="ml-1 tabular-nums opacity-60">
                                                        {tabCounts[tab.id]}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <TextInput
                                        className="block w-full rounded-full border-border/80 bg-background text-sm"
                                        value={filter}
                                        onChange={(e) =>
                                            setFilter(e.target.value)
                                        }
                                        placeholder="Search templates…"
                                    />
                                </div>

                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                                    {pageLoading ? (
                                        <div className="space-y-1">
                                            {[...Array(8)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="flex animate-pulse items-center gap-3 rounded-lg px-3 py-2.5"
                                                >
                                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-muted" />
                                                    <div className="flex-1 space-y-1.5">
                                                        <div className="h-3 w-3/4 rounded bg-muted" />
                                                        <div className="h-2 w-1/2 rounded bg-muted" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : visibleCards.length === 0 ? (
                                        <p className="text-muted-foreground py-12 text-center text-sm">
                                            {filter
                                                ? 'No templates match your search.'
                                                : activeTab === 'default'
                                                  ? 'No default template is set.'
                                                  : activeTab === 'custom'
                                                    ? 'No custom templates yet. Clone a general template to get started.'
                                                    : 'No templates found.'}
                                        </p>
                                    ) : (
                                        <div className="space-y-0.5">
                                            <p className="text-muted-foreground mb-2 px-1 text-xs font-medium">
                                                {visibleCards.length} template
                                                {visibleCards.length === 1
                                                    ? ''
                                                    : 's'}
                                            </p>
                                            {visibleCards.map((target) =>
                                                renderCard(target),
                                            )}
                                        </div>
                                    )}
                                </div>
                            </aside>

                        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-gradient-to-br from-muted/40 via-background to-background">
                            <div className="shrink-0 border-b border-border/80 bg-card/50 px-6 py-4 backdrop-blur-sm">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-foreground text-xl font-semibold tracking-tight">
                                            {previewTitle ?? 'Template preview'}
                                        </h3>
                                        {previewDraft ? (
                                            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                                                <span>
                                                    {invoiceTypeLabel(
                                                        previewDraft.invoice_type ??
                                                            'standard',
                                                    )}
                                                </span>
                                                {isSelectedDefault ? (
                                                    <span className="rounded-full bg-sidebar-primary/15 px-2.5 py-0.5 text-xs font-semibold text-sidebar-primary">
                                                        Default
                                                    </span>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </div>

                                    {previewTarget ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            {!isSelectedDefault ? (
                                                <PrimaryButton
                                                    type="button"
                                                    disabled={Boolean(busyId)}
                                                    className="normal-case tracking-normal"
                                                    onClick={() =>
                                                        void handleSetDefaultFor(
                                                            previewTarget,
                                                        )
                                                    }
                                                >
                                                    Use as default
                                                </PrimaryButton>
                                            ) : null}

                                            {previewTarget.kind === 'system' ? (
                                                <SecondaryButton
                                                    className="normal-case tracking-normal"
                                                    disabled={
                                                        busyId ===
                                                        `sys-${previewTarget.id}`
                                                    }
                                                    onClick={() => {
                                                        const row =
                                                            systemRows.find(
                                                                (r) =>
                                                                    r.id ===
                                                                    previewTarget.id,
                                                            );
                                                        if (row) {
                                                            void handleCloneSystem(
                                                                row,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    Clone & customize
                                                </SecondaryButton>
                                            ) : (
                                                <>
                                                    <SecondaryButton
                                                        className="normal-case tracking-normal"
                                                        disabled={
                                                            busyId ===
                                                            `custom-${previewTarget.row.id}`
                                                        }
                                                        onClick={() =>
                                                            void handleCloneCustom(
                                                                previewTarget.row,
                                                            )
                                                        }
                                                    >
                                                        Clone & customize
                                                    </SecondaryButton>
                                                    {!isDefaultCustom(
                                                        previewTarget.row.id,
                                                    ) ? (
                                                        <SecondaryButton
                                                            type="button"
                                                            className="normal-case tracking-normal text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                                            disabled={
                                                                busyId ===
                                                                `del-${previewTarget.row.id}`
                                                            }
                                                            onClick={() =>
                                                                void handleDelete(
                                                                    previewTarget.row,
                                                                )
                                                            }
                                                        >
                                                            {busyId ===
                                                            `del-${previewTarget.row.id}`
                                                                ? 'Removing…'
                                                                : 'Remove'}
                                                        </SecondaryButton>
                                                    ) : null}
                                                </>
                                            )}

                                            <SecondaryButton
                                                className="normal-case tracking-normal"
                                                disabled={
                                                    !previewDraft || downloading
                                                }
                                                onClick={async () => {
                                                    if (!previewDraft) {
                                                        return;
                                                    }
                                                    setDownloading(true);
                                                    try {
                                                        await downloadInvoicePdf(
                                                            previewDraft,
                                                        );
                                                    } finally {
                                                        setDownloading(false);
                                                    }
                                                }}
                                            >
                                                {downloading
                                                    ? 'Preparing PDF…'
                                                    : 'Download PDF'}
                                            </SecondaryButton>
                                        </div>
                                    ) : null}
                                </div>

                                {previewTarget ? (
                                    <p className="text-muted-foreground mt-3 text-sm">
                                        {isSelectedDefault
                                            ? 'This is your company default template.'
                                            : 'Set as default or clone to customize.'}
                                    </p>
                                ) : null}
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
                                {previewDraft ? (
                                    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/20 ring-1 ring-black/5">
                                        <InvoicePreview draft={previewDraft} />
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[12rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/80 px-6 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                <svg
                                                    className="h-8 w-8 text-muted-foreground"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth={1.5}
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-muted-foreground text-sm">
                                                {pageLoading
                                                    ? 'Loading preview…'
                                                    : 'Select a template from the left to preview it here'}
                                            </p>
                                        </div>
                                )}
                            </div>

                        </main>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
