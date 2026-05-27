import ListingIndex from '@/Components/ListingIndex';
import AdminDetailPanel from '@/Components/admin/AdminDetailPanel';
import AdminInvoicesListPanel from '@/Components/admin/AdminInvoicesListPanel';
import AdminTabs, { AdminTabPanel } from '@/Components/admin/AdminTabs';
import AdminLayout from '@/Layouts/AdminLayout';
import { listingIndexThClass } from '@/utils/listingIndex';
import {
    companyAddressFields,
    companyInvoiceFields,
    companyOverviewFields,
    companyPaymentFields,
    companyTaxFields,
    companyTermsFields,
} from '@/utils/adminEntityFields';
import { adminApiPost, type ApiEnvelope } from '@/api/adminClient';
import {
    BUYER_CUSTOMER_LABEL,
    BUYERS_CUSTOMERS_LABEL,
} from '@/constants/buyerLabels';
import type { AdminCompanyDetail } from '@/types/admin';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

type CompanyTab =
    | 'profile'
    | 'tax-payment'
    | 'invoice-settings'
    | 'invoices'
    | 'members'
    | 'buyers';

const compactTh =
    'px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground';
const compactTd = 'px-3 py-2 text-sm';

function buyerLabel(buyer: AdminCompanyDetail['buyers'][number]): string {
    return buyer.company_name?.trim() || buyer.name;
}

function MembersTab({ company }: { company: AdminCompanyDetail }) {
    if (company.users.length === 0) {
        return (
            <p className="text-muted-foreground rounded-lg border border-border bg-card px-4 py-6 text-center text-sm shadow-sm">
                No members linked to this company.
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <ul className="divide-y divide-border md:hidden">
                {company.users.map((member, index) => (
                    <li key={member.id} className="px-4 py-2.5">
                        <ListingIndex index={index} variant="mobile" />
                        <Link
                            href={route('admin.users.show', member.id)}
                            className="font-medium text-sidebar-primary hover:opacity-80 text-sm"
                        >
                            {member.name}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                            {member.email} ·{' '}
                            <span className="capitalize">{member.role}</span>
                        </p>
                    </li>
                ))}
            </ul>

            <table className="hidden w-full divide-y divide-border text-sm md:table">
                <thead className="bg-muted">
                    <tr>
                        <th className={listingIndexThClass}>#</th>
                        <th className={compactTh}>Name</th>
                        <th className={compactTh}>Email</th>
                        <th className={compactTh}>Role</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {company.users.map((member, index) => (
                        <tr key={member.id}>
                            <ListingIndex index={index} />
                            <td className={`${compactTd} font-medium text-foreground`}>
                                <Link
                                    href={route('admin.users.show', member.id)}
                                    className="text-sidebar-primary hover:opacity-80"
                                >
                                    {member.name}
                                </Link>
                            </td>
                            <td className={`${compactTd} text-muted-foreground`}>
                                {member.email}
                            </td>
                            <td className={`${compactTd} text-muted-foreground capitalize`}>
                                {member.role}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function BuyersTab({ company }: { company: AdminCompanyDetail }) {
    if (company.buyers.length === 0) {
        return (
            <p className="text-muted-foreground rounded-lg border border-border bg-card px-4 py-6 text-center text-sm shadow-sm">
                No {BUYERS_CUSTOMERS_LABEL.toLowerCase()} saved for this company.
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
            <ul className="divide-y divide-border md:hidden">
                {company.buyers.map((buyer, index) => (
                    <li key={buyer.id} className="px-4 py-2.5">
                        <ListingIndex index={index} variant="mobile" />
                        <Link
                            href={route('admin.buyers.show', buyer.id)}
                            className="font-medium text-sidebar-primary hover:opacity-80 text-sm"
                        >
                            {buyerLabel(buyer)}
                        </Link>
                        <p className="text-muted-foreground text-xs">
                            {[buyer.email, buyer.phone, buyer.gst ?? buyer.tax_id]
                                .filter(Boolean)
                                .join(' · ') || '—'}
                        </p>
                    </li>
                ))}
            </ul>

            <table className="hidden w-full divide-y divide-border text-sm md:table">
                <thead className="bg-muted">
                    <tr>
                        <th className={listingIndexThClass}>#</th>
                        <th className={compactTh}>{BUYER_CUSTOMER_LABEL}</th>
                        <th className={compactTh}>Email</th>
                        <th className={compactTh}>Phone</th>
                        <th className={compactTh}>GSTIN</th>
                        <th className={compactTh}>Location</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {company.buyers.map((buyer, index) => (
                        <tr key={buyer.id}>
                            <ListingIndex index={index} />
                            <td className={`${compactTd} font-medium text-foreground`}>
                                <Link
                                    href={route('admin.buyers.show', buyer.id)}
                                    className="text-sidebar-primary hover:opacity-80"
                                >
                                    {buyerLabel(buyer)}
                                </Link>
                            </td>
                            <td className={`${compactTd} text-muted-foreground`}>
                                {buyer.email ?? '—'}
                            </td>
                            <td className={`${compactTd} text-muted-foreground`}>
                                {buyer.phone ?? '—'}
                            </td>
                            <td className={`${compactTd} text-muted-foreground`}>
                                {buyer.gst ?? buyer.tax_id ?? '—'}
                            </td>
                            <td className={`${compactTd} text-muted-foreground`}>
                                {[buyer.city, buyer.state].filter(Boolean).join(', ') ||
                                    '—'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function InvoicesTab({ companyId }: { companyId: number }) {
    return <AdminInvoicesListPanel companyId={companyId} />;
}

export default function AdminCompanyShow({
    companyId,
}: {
    companyId: number;
}) {
    const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<CompanyTab>('profile');

    useEffect(() => {
        const load = async () => {
            const res = await adminApiPost<ApiEnvelope<AdminCompanyDetail>>(
                '/companies/company-show',
                { id: companyId },
            );

            if (res.success && res.data) {
                setCompany(res.data);
            } else {
                setError(res.message || 'Company not found.');
            }

            setLoading(false);
        };

        void load();
    }, [companyId]);

    const tabs = company
        ? [
              { id: 'profile' as const, label: 'Profile' },
              { id: 'tax-payment' as const, label: 'Tax & payment' },
              { id: 'invoice-settings' as const, label: 'Invoice settings' },
              {
                  id: 'invoices' as const,
                  label: 'Invoices',
                  count: company.invoices_count ?? 0,
              },
              {
                  id: 'members' as const,
                  label: 'Members',
                  count: company.users.length,
              },
              {
                  id: 'buyers' as const,
                  label: BUYERS_CUSTOMERS_LABEL,
                  count: company.buyers_count ?? company.buyers.length,
              },
          ]
        : [];

    return (
        <AdminLayout
            header={
                <div>
                    <Link
                        href={route('admin.companies.index')}
                        className="text-muted-foreground mb-0.5 inline-block text-sm hover:text-foreground"
                    >
                        ← Companies
                    </Link>
                    <h2 className="text-foreground text-lg font-semibold">
                        {company?.name ?? 'Company'}
                    </h2>
                </div>
            }
        >
            <Head title={company?.name ?? 'Company'} />

            <div className="py-4">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    {loading ? (
                        <p className="text-muted-foreground text-center text-sm">
                            Loading…
                        </p>
                    ) : error || !company ? (
                        <div className="overflow-hidden rounded-lg border border-border bg-card p-4 text-center shadow-sm">
                            <p className="text-muted-foreground text-sm">
                                {error}
                            </p>
                            <Link
                                href={route('admin.companies.index')}
                                className="font-medium text-sidebar-primary hover:opacity-80 mt-2 inline-block text-sm"
                            >
                                Back to companies
                            </Link>
                        </div>
                    ) : (
                        <>
                            <AdminTabs
                                tabs={tabs}
                                active={activeTab}
                                onChange={setActiveTab}
                                ariaLabel="Company detail tabs"
                            />

                            <AdminTabPanel active={activeTab} id="profile">
                                <AdminDetailPanel
                                    groups={[
                                        {
                                            title: 'Overview',
                                            fields: companyOverviewFields(company),
                                            logoUrl: company.logo_data_url,
                                        },
                                        {
                                            title: 'Address',
                                            fields: companyAddressFields(company),
                                        },
                                    ]}
                                />
                            </AdminTabPanel>

                            <AdminTabPanel active={activeTab} id="tax-payment">
                                <AdminDetailPanel
                                    groups={[
                                        {
                                            title: 'Tax',
                                            fields: companyTaxFields(company),
                                        },
                                        {
                                            title: 'Payment',
                                            fields: companyPaymentFields(company),
                                        },
                                    ]}
                                />
                            </AdminTabPanel>

                            <AdminTabPanel active={activeTab} id="invoice-settings">
                                <AdminDetailPanel
                                    groups={[
                                        {
                                            title: 'Terms & signature',
                                            fields: companyTermsFields(company),
                                        },
                                        {
                                            title: 'Invoice defaults',
                                            fields: companyInvoiceFields(company),
                                        },
                                    ]}
                                />
                            </AdminTabPanel>

                            <AdminTabPanel active={activeTab} id="invoices">
                                <InvoicesTab companyId={company.id} />
                            </AdminTabPanel>

                            <AdminTabPanel active={activeTab} id="members">
                                <MembersTab company={company} />
                            </AdminTabPanel>

                            <AdminTabPanel active={activeTab} id="buyers">
                                <BuyersTab company={company} />
                            </AdminTabPanel>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
