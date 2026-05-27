import AdminTemplatesTable from '@/Components/admin/AdminTemplatesTable';
import AdminTemplatePreviewModal from '@/Components/admin/AdminTemplatePreviewModal';
import ListingPagination from '@/Components/ListingPagination';
import TextInput from '@/Components/TextInput';
import { LISTING_PER_PAGE } from '@/utils/listingIndex';
import { adminApiPost, type ApiEnvelope } from '@/api/adminClient';
import type { AdminTemplateRow } from '@/types/admin';
import type {
    CustomTemplateRow,
    SystemTemplateRow,
    TemplatesListData,
} from '@/invoices/customTemplatesApi';
import { useCallback, useEffect, useMemo, useState } from 'react';

type TabId = 'all' | 'default' | 'general' | 'custom';

const TABS: { id: TabId; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'default', label: 'Default' },
    { id: 'general', label: 'General' },
    { id: 'custom', label: 'Custom' },
];

type Props = {
    companyId?: number;
    showCompany?: boolean;
};

type PaginatedCustom = {
    data: AdminTemplateRow[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

function systemToRow(row: SystemTemplateRow & AdminTemplateRow): AdminTemplateRow {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        base_invoice_type: row.base_invoice_type,
        base_type_label: row.name,
        layout: row.layout,
        is_custom: false,
        is_system: true,
        is_default: row.is_default,
        company_id: row.company_id,
        company_name: row.company_name,
    };
}

function customToRow(row: CustomTemplateRow & AdminTemplateRow): AdminTemplateRow {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        base_invoice_type: row.base_invoice_type,
        base_type_label: row.base_type_label,
        layout: row.layout,
        is_custom: true,
        is_default: row.is_default,
        company_id: row.company_id,
        company_name: row.company_name,
        created_at: row.created_at,
    };
}

export default function AdminTemplatesListPanel({
    companyId,
    showCompany = companyId === undefined,
}: Props) {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabId>('all');
    const [filter, setFilter] = useState('');
    const [companyData, setCompanyData] = useState<TemplatesListData | null>(
        null,
    );
    const [globalRows, setGlobalRows] = useState<AdminTemplateRow[]>([]);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: null as number | null,
        to: null as number | null,
    });
    const [previewRow, setPreviewRow] = useState<AdminTemplateRow | null>(
        null,
    );

    const loadCompany = useCallback(async () => {
        if (!companyId) {
            return;
        }

        setLoading(true);
        const res = await adminApiPost<ApiEnvelope<TemplatesListData>>(
            '/invoice-templates/invoice-templates-list',
            { company_id: companyId },
        );

        if (res.success && res.data) {
            setCompanyData(res.data);
        }

        setLoading(false);
    }, [companyId]);

    const loadGlobal = useCallback(async () => {
        if (companyId) {
            return;
        }

        setLoading(true);
        const res = await adminApiPost<ApiEnvelope<PaginatedCustom>>(
            '/invoice-templates/invoice-templates-list',
            {
                per_page: LISTING_PER_PAGE,
                current_page: page,
                keyword: search || undefined,
            },
        );

        if (res.success && res.data) {
            setGlobalRows(res.data.data);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                from: res.data.from,
                to: res.data.to,
            });
        }

        setLoading(false);
    }, [companyId, page, search]);

    useEffect(() => {
        if (companyId) {
            void loadCompany();
        } else {
            void loadGlobal();
        }
    }, [companyId, loadCompany, loadGlobal]);

    const companyRows = useMemo((): AdminTemplateRow[] => {
        if (!companyData) {
            return [];
        }

        const q = filter.trim().toLowerCase();
        const system = companyData.system
            .map((row) =>
                systemToRow(row as SystemTemplateRow & AdminTemplateRow),
            )
            .filter(
                (row) =>
                    !q ||
                    row.name.toLowerCase().includes(q) ||
                    (row.description ?? '').toLowerCase().includes(q),
            );
        const custom = companyData.custom
            .map((row) =>
                customToRow(row as CustomTemplateRow & AdminTemplateRow),
            )
            .filter(
                (row) =>
                    !q ||
                    row.name.toLowerCase().includes(q) ||
                    (row.description ?? '').toLowerCase().includes(q),
            );

        if (activeTab === 'default') {
            return [...system, ...custom].filter((row) => row.is_default);
        }
        if (activeTab === 'general') {
            return system;
        }
        if (activeTab === 'custom') {
            return custom;
        }

        return [...system, ...custom];
    }, [activeTab, companyData, filter]);

    const tabCounts = useMemo(() => {
        if (!companyData) {
            return { all: 0, default: 0, general: 0, custom: 0 };
        }

        const system = companyData.system.map((row) =>
            systemToRow(row as SystemTemplateRow & AdminTemplateRow),
        );
        const custom = companyData.custom.map((row) =>
            customToRow(row as CustomTemplateRow & AdminTemplateRow),
        );
        const all = [...system, ...custom];

        return {
            all: all.length,
            default: all.filter((row) => row.is_default).length,
            general: system.length,
            custom: custom.length,
        };
    }, [companyData]);

    if (loading) {
        return (
            <p className="text-muted-foreground text-center text-sm">
                Loading templates…
            </p>
        );
    }

    if (companyId) {
        return (
            <>
                <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                    <div className="border-b border-border p-4">
                        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-4">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`rounded-lg px-2 py-2 text-[11px] font-semibold transition ${
                                        activeTab === tab.id
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}{' '}
                                    <span className="tabular-nums opacity-60">
                                        {tabCounts[tab.id]}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <TextInput
                            className="block w-full bg-background text-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Search templates…"
                        />
                    </div>

                    {companyRows.length === 0 ? (
                        <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                            No templates match this view.
                        </p>
                    ) : (
                        <AdminTemplatesTable
                            rows={companyRows}
                            showCompany={showCompany}
                            onPreview={setPreviewRow}
                        />
                    )}
                </div>

                <AdminTemplatePreviewModal
                    row={previewRow}
                    onClose={() => setPreviewRow(null)}
                />
            </>
        );
    }

    return (
        <>
            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                <div className="border-b border-border p-4">
                <p className="text-muted-foreground mb-3 text-sm">
                    Custom templates saved by companies. General templates are
                    viewed per company.
                </p>
                <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        setPage(1);
                        setSearch(filter.trim());
                    }}
                >
                    <TextInput
                        className="min-w-[200px] flex-1 bg-background text-sm"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        placeholder="Search template or company…"
                    />
                    <button
                        type="submit"
                        className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                    >
                        Search
                    </button>
                </form>
                </div>

                {globalRows.length === 0 ? (
                <p className="text-muted-foreground px-4 py-6 text-center text-sm">
                    No custom templates found.
                </p>
            ) : (
                <>
                    <AdminTemplatesTable
                        rows={globalRows}
                        showCompany
                        onPreview={setPreviewRow}
                    />
                    <ListingPagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        total={pagination.total}
                        from={pagination.from}
                        to={pagination.to}
                        onPageChange={setPage}
                    />
                </>
                )}
            </div>

            <AdminTemplatePreviewModal
                row={previewRow}
                onClose={() => setPreviewRow(null)}
            />
        </>
    );
}
