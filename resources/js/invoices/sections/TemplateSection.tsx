import InputLabel from '@/Components/InputLabel';
import { formatForInvoiceType } from '../invoiceFormatConfig';
import {
    fetchTemplatesList,
    type CustomTemplateRow,
    type SystemTemplateRow,
    type TemplatesListData,
} from '../customTemplatesApi';
import {
    applyTemplateSelection,
    buildTemplateSelectKey,
    defaultTemplateLabel,
    type TemplateSelectKey,
} from '../templateSelect';
import { invoiceTypeLabel } from '../invoiceTypes';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Accordion from './Accordion';
import type { InvoiceDraft } from '../types';

type Props = {
    draft: InvoiceDraft;
    onChange: (patch: Partial<InvoiceDraft>) => void;
    /** True on create invoice — initial selection follows company default */
    isNewInvoice?: boolean;
};

export default function TemplateSection({
    draft,
    onChange,
    isNewInvoice = false,
}: Props) {
    const [listData, setListData] = useState<TemplatesListData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedKey, setSelectedKey] = useState<TemplateSelectKey>('');
    const initialized = useRef(false);

    useEffect(() => {
        void fetchTemplatesList().then((res) => {
            if (res.success && res.data) {
                setListData(res.data);
            }
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (!listData || initialized.current) {
            return;
        }
        initialized.current = true;

        if (isNewInvoice) {
            setSelectedKey(
                buildTemplateSelectKey(
                    listData.default_custom_template_id,
                    listData.default_invoice_type ?? 'standard',
                ),
            );
        } else {
            setSelectedKey(`system:${draft.invoice_type ?? 'standard'}`);
        }
    }, [listData, isNewInvoice, draft.invoice_type]);

    const systemRows = listData?.system ?? [];
    const customRows = listData?.custom ?? [];

    const companyDefaultKey = listData
        ? buildTemplateSelectKey(
              listData.default_custom_template_id,
              listData.default_invoice_type ?? 'standard',
          )
        : '';

    const companyDefaultName = listData
        ? defaultTemplateLabel(
              listData.default_custom_template_id,
              listData.default_invoice_type ?? 'standard',
              systemRows,
              customRows,
          )
        : '';

    const handleSelect = (key: TemplateSelectKey) => {
        setSelectedKey(key);
        onChange(
            applyTemplateSelection(draft, key, systemRows, customRows),
        );
    };

    const isUsingCompanyDefault =
        isNewInvoice && selectedKey === companyDefaultKey;

    return (
        <Accordion title="Invoice template" defaultOpen>
            <div>
                <InputLabel value="Template" />
                {loading ? (
                    <p className="mt-2 text-sm text-gray-500">
                        Loading templates…
                    </p>
                ) : (
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={selectedKey}
                        onChange={(e) => handleSelect(e.target.value)}
                    >
                        <optgroup label="General templates">
                            {systemRows.map((row: SystemTemplateRow) => (
                                <option
                                    key={`system-${row.id}`}
                                    value={`system:${row.id}`}
                                >
                                    {row.name}
                                    {row.id ===
                                    listData?.default_invoice_type &&
                                    !listData?.default_custom_template_id
                                        ? ' — company default'
                                        : ''}
                                </option>
                            ))}
                        </optgroup>

                        <optgroup label="Custom templates">
                            {customRows.length === 0 ? (
                                <option disabled value="">
                                    No custom templates saved
                                </option>
                            ) : (
                                customRows.map((row: CustomTemplateRow) => (
                                    <option
                                        key={`custom-${row.id}`}
                                        value={`custom:${row.id}`}
                                    >
                                        {row.name}
                                        {row.id ===
                                        listData?.default_custom_template_id
                                            ? ' — company default'
                                            : ''}
                                    </option>
                                ))
                            )}
                        </optgroup>
                    </select>
                )}

                {isUsingCompanyDefault ? (
                    <p className="mt-2 text-sm text-green-700">
                        Using your company default:{' '}
                        <strong>{companyDefaultName}</strong>
                    </p>
                ) : (
                    <p className="mt-2 text-sm text-gray-600">
                        Selected:{' '}
                        <strong>
                            {invoiceTypeLabel(
                                draft.invoice_type ?? 'standard',
                            )}
                        </strong>{' '}
                        ({formatForInvoiceType(
                            draft.invoice_type ?? 'standard',
                        )}{' '}
                        format)
                    </p>
                )}

                <p className="mt-2 text-xs text-gray-500">
                    <Link
                        href={route('settings.templates.library')}
                        className="text-indigo-600 hover:text-indigo-800"
                    >
                        Manage templates
                    </Link>
                    {' · '}
                    <Link
                        href={route('settings.templates')}
                        className="text-indigo-600 hover:text-indigo-800"
                    >
                        Change company default
                    </Link>
                </p>
            </div>
        </Accordion>
    );
}
