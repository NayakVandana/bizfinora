import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { pageContainer, pageShell } from '@/lib/pageLayout';
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
                <h2 className="text-foreground text-xl font-semibold leading-tight">
                    {title}
                </h2>
            }
        >
            <Head title={headTitle ?? title} />

            <div className={pageShell}>
                <div className={pageContainer}>
                    <div className="overflow-hidden rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
