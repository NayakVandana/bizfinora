import {
    adminApiPost,
    type ApiEnvelope,
    isAdminApiUnauthorized,
} from '@/api/adminClient';
import { userApiPost } from '@/api/userClient';
import {
    getAdminApiToken,
    getUserApiToken,
    setAdminApiToken,
} from '@/auth/authToken';
import {
    getStoredAdminUser,
    setStoredAdminUser,
} from '@/auth/adminUserStorage';
import type { AdminUser } from '@/types/admin';
import type { User } from '@/types';
import { useCallback, useEffect, useState } from 'react';

let cachedAdminUser: AdminUser | null = getStoredAdminUser();

export function clearAdminAuthCache(): void {
    cachedAdminUser = null;
}

function userToAdminUser(user: User): AdminUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        is_admin: true,
    };
}

async function resolveAdminUser(): Promise<AdminUser | null> {
    if (getAdminApiToken()) {
        return cachedAdminUser ?? getStoredAdminUser();
    }

    if (!getUserApiToken()) {
        return null;
    }

    try {
        const res = await userApiPost<ApiEnvelope<User>>(
            '/profile/profile-show',
            {},
        );

        if (res.success && res.data?.is_admin) {
            return userToAdminUser(res.data);
        }
    } catch {
        return null;
    }

    return null;
}

export function useAdminAuth() {
    const [user, setUser] = useState<AdminUser | null>(cachedAdminUser);
    const [loading, setLoading] = useState(
        () =>
            Boolean(getAdminApiToken() || getUserApiToken()) &&
            !cachedAdminUser,
    );

    const applyUser = useCallback((next: AdminUser | null) => {
        cachedAdminUser = next;
        if (getAdminApiToken()) {
            setStoredAdminUser(next);
        }
        setUser(next);
    }, []);

    useEffect(() => {
        if (!getAdminApiToken() && !getUserApiToken()) {
            applyUser(null);
            setLoading(false);

            return;
        }

        if (getAdminApiToken() && cachedAdminUser) {
            applyUser(cachedAdminUser);
            setLoading(false);

            return;
        }

        void (async () => {
            setLoading(true);
            const next = await resolveAdminUser();
            applyUser(next);
            setLoading(false);
        })();
    }, [applyUser]);

    const login = useCallback(
        async (email: string, password: string) => {
            const res = await adminApiPost<
                ApiEnvelope<{ user: AdminUser; token: string }>
            >('/auth/admin-login', { email, password });

            if (!res.success || !res.data?.token || !res.data.user) {
                return {
                    ok: false as const,
                    message: res.message || 'Invalid credentials.',
                };
            }

            setAdminApiToken(res.data.token);
            applyUser(res.data.user);

            return { ok: true as const };
        },
        [applyUser],
    );

    const logout = useCallback(async () => {
        try {
            if (getAdminApiToken()) {
                await adminApiPost('/auth/admin-logout', {});
            }
        } catch (error) {
            if (!isAdminApiUnauthorized(error)) {
                // ignore network errors on logout
            }
        } finally {
            setAdminApiToken(null);
            clearAdminAuthCache();
            applyUser(null);
        }
    }, [applyUser]);

    return {
        user,
        loading,
        isLoggedIn: Boolean(
            user?.is_admin &&
                (getAdminApiToken() || getUserApiToken()),
        ),
        login,
        logout,
    };
}
