import Dropdown from '@/Components/Dropdown';
import { userApiPost, type ApiEnvelope } from '@/api/userClient';
import { useAuthUser } from '@/auth/useAuthUser';
import type { Company } from '@/types';
import { Link } from '@inertiajs/react';

function PlusIcon({ className = 'h-4 w-4' }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
        >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
        </svg>
    );
}

function NewCompanyButton({ className = '' }: { className?: string }) {
    return (
        <Link
            href={route('companies.create')}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 ${className}`}
        >
            <PlusIcon />
            New company
        </Link>
    );
}

export default function CompanySwitcher() {
    const { currentCompany, companies, refresh } = useAuthUser();

    if (companies.length === 0) {
        return <NewCompanyButton className="w-auto" />;
    }

    const switchCompany = async (company: Company) => {
        if (company.id === currentCompany?.id) {
            return;
        }

        const res = await userApiPost<ApiEnvelope<Company>>(
            '/companies/company-switch',
            { id: company.id },
        );

        if (res.success) {
            await refresh();
        }
    };

    return (
        <Dropdown>
            <Dropdown.Trigger>
                <span className="inline-flex rounded-md">
                    <button
                        type="button"
                        className="inline-flex max-w-[14rem] items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none"
                    >
                        <span className="truncate">
                            {currentCompany?.name ?? 'Select company'}
                        </span>
                        <svg
                            className="-me-0.5 ms-2 h-4 w-4 shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </span>
            </Dropdown.Trigger>

            <Dropdown.Content
                align="left"
                width="auto"
                contentClasses="overflow-hidden rounded-md bg-white py-1"
            >
                <ul className="max-h-64 overflow-y-auto" role="listbox">
                    {companies.map((company) => {
                        const isActive = company.id === currentCompany?.id;

                        return (
                            <li key={company.id}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => void switchCompany(company)}
                                    className={`flex w-full items-start gap-2 px-3 py-2.5 text-start text-sm transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none ${
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-800'
                                            : 'text-slate-700'
                                    }`}
                                >
                                    <span
                                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                            isActive
                                                ? 'bg-indigo-500'
                                                : 'bg-transparent'
                                        }`}
                                        aria-hidden
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={`block truncate ${
                                                isActive
                                                    ? 'font-semibold'
                                                    : 'font-medium'
                                            }`}
                                        >
                                            {company.name}
                                        </span>
                                        {isActive ? (
                                            <span className="mt-0.5 block text-xs font-medium text-indigo-600">
                                                Active workspace
                                            </span>
                                        ) : null}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>

                <div className="border-t border-slate-100 bg-slate-50/80 p-2">
                    <NewCompanyButton />
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
