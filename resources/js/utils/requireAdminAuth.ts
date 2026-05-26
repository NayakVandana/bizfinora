import { getAdminApiToken, getUserApiToken } from '@/auth/authToken';
import { router } from '@inertiajs/react';

export function requireAdminAuthPage(): void {
    if (!getAdminApiToken() && !getUserApiToken()) {
        router.visit(route('admin.login'));
    }
}
