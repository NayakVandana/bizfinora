import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    title: string;
    headTitle?: string;
}>;

export default function ProfileLayout({
    title,
    headTitle,
    children,
}: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    {title}
                </h2>
            }
        >
            <Head title={headTitle ?? title} />

            <div className="py-6 sm:py-8">
                <div className="mx-auto max-w-3xl px-3 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl bg-white p-5 shadow-sm sm:p-8">
                        <div className="max-w-xl">{children}</div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
