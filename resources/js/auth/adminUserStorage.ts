import type { AdminUser } from '@/types/admin';

const ADMIN_USER_KEY = 'admin_user';

export function getStoredAdminUser(): AdminUser | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as AdminUser;
    } catch {
        return null;
    }
}

export function setStoredAdminUser(user: AdminUser | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (!user) {
        localStorage.removeItem(ADMIN_USER_KEY);

        return;
    }

    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}
