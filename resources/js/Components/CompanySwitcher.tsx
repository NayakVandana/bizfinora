import Dropdown from '@/Components/Dropdown';
import { userApiPost, type ApiEnvelope } from '@/api/userClient';
import { useAuthUser } from '@/auth/useAuthUser';
import type { Company } from '@/types';
import { Link } from '@inertiajs/react';

export default function CompanySwitcher() {
    const { currentCompany, companies, refresh } = useAuthUser();

    if (companies.length === 0) {
        return null;
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
                        className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none"
                    >
                        <span className="max-w-[10rem] truncate">
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

            <Dropdown.Content align="left" width="48">
                {companies.map((company) => (
                    <button
                        key={company.id}
                        type="button"
                        onClick={() => void switchCompany(company)}
                        className={`block w-full px-4 py-2 text-start text-sm leading-5 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                            company.id === currentCompany?.id
                                ? 'bg-indigo-50 font-medium text-indigo-700'
                                : 'text-gray-700'
                        }`}
                    >
                        {company.name}
                        {company.id === currentCompany?.id && (
                            <span className="ms-1 text-xs text-indigo-500">
                                (active)
                            </span>
                        )}
                    </button>
                ))}
                <div className="border-t border-gray-100" />
                <Dropdown.Link href={route('companies.index')}>
                    Manage companies
                </Dropdown.Link>
            </Dropdown.Content>
        </Dropdown>
    );
}
