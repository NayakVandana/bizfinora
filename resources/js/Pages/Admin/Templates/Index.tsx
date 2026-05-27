import AdminTemplatesListPanel from '@/Components/admin/AdminTemplatesListPanel';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function AdminTemplatesIndex() {
    return (
        <AdminLayout
            header={
                <h2 className="text-foreground text-lg font-semibold">
                    Templates
                </h2>
            }
        >
            <Head title="Admin — Templates" />

            <div className="py-4">
                <div className="w-full px-3 sm:px-6 lg:px-8">
                    <AdminTemplatesListPanel />
                </div>
            </div>
        </AdminLayout>
    );
}
