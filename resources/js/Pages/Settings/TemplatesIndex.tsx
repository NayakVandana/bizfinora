import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
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
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTemplatePreviewData } from './useTemplatePreviewData';

type PreviewTarget =
    | { kind: 'system'; id: string; name: string }
    | { kind: 'custom'; row: CustomTemplateRow };

type TabId = 'all' | 'general' | 'custom';

const TABS: { id: TabId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'general', label: 'General' },
    { id: 'custom', label: 'Custom' },
];

export default function TemplatesIndex() {
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

    const handleCloneSystem = async (row: SystemTemplateRow) => {
        setBusyId(`sys-${row.id}`);
        setMessage(null);
        try {
            const res = await cloneSystemTemplate(row.id);
            if (res.success && res.data) {
                setMessage(`Cloned “${row.name}” — customize and save.`);
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
                setMessage(`Cloned “${row.name}”.`);
                await reload();
            } else {
                setMessage(res.message ?? 'Clone failed.');
            }
        } finally {
            setBusyId(null);
        }
    };

    const handleSetDefaultSystem = async (typeId: string) => {
        setBusyId(`def-sys-${typeId}`);
        setMessage(null);
        try {
            const res = await setDefaultTemplate({ systemType: typeId });
            if (res.success) {
                setMessage('Default template set to general template.');
                await reload();
            } else {
                setMessage(res.message ?? 'Failed.');
            }
        } finally {
            setBusyId(null);
        }
    };

    const handleSetDefaultCustom = async (id: number) => {
        setBusyId(`def-custom-${id}`);
        setMessage(null);
        try {
            const res = await setDefaultTemplate({ customTemplateId: id });
            if (res.success) {
                setMessage('Default template set to your custom template.');
                await reload();
            } else {
                setMessage(res.message ?? 'Failed.');
            }
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async (row: CustomTemplateRow) => {
        if (
            !window.confirm(
                `Delete template “${row.name}”? This cannot be undone.`,
            )
        ) {
            return;
        }
        setBusyId(`del-${row.id}`);
        setMessage(null);
        try {
            const res = await deleteCustomTemplate(row.id);
            setMessage(
                res.success
                    ? 'Template deleted.'
                    : (res.message ?? 'Delete failed.'),
            );
            if (res.success) {
                if (
                    previewTarget?.kind === 'custom' &&
                    previewTarget.row.id === row.id
                ) {
                    setPreviewTarget(null);
                }
                await reload();
            }
        } finally {
            setBusyId(null);
        }
    };

    const openSystemPreview = (row: SystemTemplateRow) => {
        setPreviewTarget({ kind: 'system', id: row.id, name: row.name });
    };

    const openCustomPreview = (row: CustomTemplateRow) => {
        setPreviewTarget({ kind: 'custom', row });
    };

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

    const tabCounts: Record<TabId, number> = {
        all: systemRows.length + customRows.length,
        general: systemRows.length,
        custom: customRows.length,
    };

    const showGeneral = activeTab === 'all' || activeTab === 'general';
    const showCustom = activeTab === 'all' || activeTab === 'custom';

    const pageLoading = loading || previewDataLoading;
    const emptyInTab =
        (activeTab === 'general' && systemRows.length === 0) ||
        (activeTab === 'custom' && customRows.length === 0) ||
        (activeTab === 'all' &&
            systemRows.length === 0 &&
            customRows.length === 0);

    const renderSystemRow = (row: SystemTemplateRow) => (
        <li
            key={`sys-${row.id}`}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">
                    {row.name}
                    <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        General
                    </span>
                    {isDefaultSystem(row.id) ? (
                        <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                            Default
                        </span>
                    ) : null}
                </p>
                <p className="text-sm text-gray-500">{row.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                <SecondaryButton
                    type="button"
                    onClick={() => openSystemPreview(row)}
                >
                    Preview
                </SecondaryButton>
                <SecondaryButton
                    disabled={busyId === `sys-${row.id}`}
                    onClick={() => void handleCloneSystem(row)}
                >
                    {busyId === `sys-${row.id}`
                        ? 'Cloning…'
                        : 'Clone & customize'}
                </SecondaryButton>
                {!isDefaultSystem(row.id) ? (
                    <SecondaryButton
                        disabled={busyId === `def-sys-${row.id}`}
                        onClick={() => void handleSetDefaultSystem(row.id)}
                    >
                        Set default
                    </SecondaryButton>
                ) : null}
            </div>
        </li>
    );

    const renderCustomRow = (row: CustomTemplateRow) => (
        <li
            key={`custom-${row.id}`}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
            <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900">
                    {row.name}
                    <span className="ml-2 rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                        Custom
                    </span>
                    {isDefaultCustom(row.id) ? (
                        <span className="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800">
                            Default
                        </span>
                    ) : null}
                </p>
                <p className="text-sm text-gray-500">
                    Based on{' '}
                    {row.base_type_label ||
                        invoiceTypeLabel(row.base_invoice_type)}
                    {row.description ? ` · ${row.description}` : ''}
                </p>
            </div>
            <div className="flex flex-wrap gap-2">
                <SecondaryButton
                    type="button"
                    onClick={() => openCustomPreview(row)}
                >
                    Preview
                </SecondaryButton>
                <Link href={route('settings.templates.edit', row.id)}>
                    <PrimaryButton type="button">Edit</PrimaryButton>
                </Link>
                <SecondaryButton
                    disabled={busyId === `custom-${row.id}`}
                    onClick={() => void handleCloneCustom(row)}
                >
                    Clone
                </SecondaryButton>
                {!isDefaultCustom(row.id) ? (
                    <SecondaryButton
                        disabled={busyId === `def-custom-${row.id}`}
                        onClick={() => void handleSetDefaultCustom(row.id)}
                    >
                        Set default
                    </SecondaryButton>
                ) : null}
                <SecondaryButton
                    disabled={busyId === `del-${row.id}`}
                    onClick={() => void handleDelete(row)}
                >
                    Delete
                </SecondaryButton>
            </div>
        </li>
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Template library
                </h2>
            }
        >
            <Head title="Templates" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <p className="mb-4 text-sm text-gray-600">
                        Browse general and custom templates. Preview any
                        template, clone to customize, save, and reuse on new
                        invoices.
                    </p>

                    <div className="mb-6 flex flex-wrap items-end gap-4">
                        <div className="min-w-[200px] flex-1">
                            <InputLabel value="Search templates" />
                            <TextInput
                                className="mt-1 block w-full"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                placeholder="Name or description…"
                            />
                        </div>
                        <Link
                            href={route('settings.templates')}
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            Default template settings →
                        </Link>
                    </div>

                    <div className="mb-6 border-b border-gray-200">
                        <nav
                            className="-mb-px flex gap-6"
                            aria-label="Template tabs"
                        >
                            {TABS.map((tab) => {
                                const selected = activeTab === tab.id;
                                const count = tabCounts[tab.id];

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={
                                            selected
                                                ? 'border-b-2 border-indigo-600 px-1 pb-3 text-sm font-medium text-indigo-600'
                                                : 'border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        }
                                    >
                                        {tab.label}
                                        <span
                                            className={
                                                selected
                                                    ? 'ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700'
                                                    : 'ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600'
                                            }
                                        >
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {message ? (
                        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            {message}
                        </div>
                    ) : null}

                    {pageLoading ? (
                        <p className="text-gray-500">Loading templates…</p>
                    ) : emptyInTab ? (
                        <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                            {filter
                                ? 'No templates match your search.'
                                : activeTab === 'custom'
                                  ? 'No custom templates yet. Clone a general template to get started.'
                                  : 'No templates found.'}
                        </p>
                    ) : (
                        <div className="space-y-8">
                            {showGeneral && systemRows.length > 0 ? (
                                <section>
                                    {activeTab === 'all' ? (
                                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                            General templates
                                        </h3>
                                    ) : null}
                                    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
                                        {systemRows.map(renderSystemRow)}
                                    </ul>
                                </section>
                            ) : null}

                            {showCustom && customRows.length > 0 ? (
                                <section>
                                    {activeTab === 'all' ? (
                                        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                                            Custom templates
                                        </h3>
                                    ) : null}
                                    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-sm">
                                        {customRows.map(renderCustomRow)}
                                    </ul>
                                </section>
                            ) : null}

                            {activeTab === 'all' &&
                            systemRows.length > 0 &&
                            customRows.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No custom templates yet. Use{' '}
                                    <strong>Clone & customize</strong> on a
                                    general template to create one.
                                </p>
                            ) : null}
                        </div>
                    )}

                    <Modal
                        show={previewTarget !== null}
                        maxWidth="6xl"
                        onClose={() => setPreviewTarget(null)}
                    >
                        <div className="p-6">
                            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {previewTitle}
                                    </h3>
                                    {previewDraft ? (
                                        <p className="text-sm text-gray-500">
                                            {invoiceTypeLabel(
                                                previewDraft.invoice_type ??
                                                    'standard',
                                            )}
                                        </p>
                                    ) : null}
                                </div>
                                <button
                                    type="button"
                                    className="text-sm text-gray-500 hover:text-gray-800"
                                    onClick={() => setPreviewTarget(null)}
                                >
                                    Close
                                </button>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto">
                                {previewDraft ? (
                                    <InvoicePreview
                                        draft={previewDraft}
                                        variant="fit"
                                    />
                                ) : (
                                    <div className="flex h-[480px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500">
                                        Preview unavailable
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                                <SecondaryButton
                                    disabled={!previewDraft || downloading}
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
                                {previewTarget?.kind === 'system' ? (
                                    <PrimaryButton
                                        disabled={
                                            busyId ===
                                            `sys-${previewTarget.id}`
                                        }
                                        onClick={() => {
                                            const row = systemRows.find(
                                                (r) =>
                                                    r.id === previewTarget.id,
                                            );
                                            if (row) {
                                                void handleCloneSystem(row);
                                            }
                                        }}
                                    >
                                        Clone & customize
                                    </PrimaryButton>
                                ) : previewTarget?.kind === 'custom' ? (
                                    <>
                                        <Link
                                            href={route(
                                                'settings.templates.edit',
                                                previewTarget.row.id,
                                            )}
                                        >
                                            <PrimaryButton type="button">
                                                Edit
                                            </PrimaryButton>
                                        </Link>
                                        <SecondaryButton
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
                                            Clone
                                        </SecondaryButton>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
