import {
    userApiPost,
    type ApiEnvelope,
    isUserApiUnauthorized,
} from '@/api/userClient';
import { getUserApiToken, setUserApiToken } from '@/auth/authToken';
import type { Company, User } from '@/types';
import { useCallback, useEffect, useState } from 'react';

type ProfilePayload = User & {
    current_company?: Company | null;
    companies?: Company[];
};

let cachedUser: User | null = null;
let cachedCurrentCompany: Company | null = null;
let cachedCompanies: Company[] = [];
let inflight: Promise<ProfilePayload | null> | null = null;

export function clearAuthUserCache(): void {
    cachedUser = null;
    cachedCurrentCompany = null;
    cachedCompanies = [];
    inflight = null;
}

async function fetchProfile(): Promise<ProfilePayload | null> {
    const token = getUserApiToken();
    if (!token) {
        clearAuthUserCache();

        return null;
    }

    try {
        const res = await userApiPost<ApiEnvelope<ProfilePayload>>(
            '/profile/profile-show',
            {},
        );

        if (res.success && res.data) {
            cachedUser = res.data;
            cachedCurrentCompany = res.data.current_company ?? null;
            cachedCompanies = res.data.companies ?? [];

            return res.data;
        }
    } catch (error) {
        if (isUserApiUnauthorized(error)) {
            setUserApiToken(null);
        }
        clearAuthUserCache();
    }

    return null;
}

export function useAuthUser() {
    const [user, setUser] = useState<User | null>(cachedUser);
    const [currentCompany, setCurrentCompany] = useState<Company | null>(
        cachedCurrentCompany,
    );
    const [companies, setCompanies] = useState<Company[]>(cachedCompanies);
    const [loading, setLoading] = useState(
        () => Boolean(getUserApiToken()) && !cachedUser,
    );

    const applyProfile = useCallback((profile: ProfilePayload | null) => {
        if (!profile) {
            setUser(null);
            setCurrentCompany(null);
            setCompanies([]);

            return;
        }

        setUser(profile);
        setCurrentCompany(profile.current_company ?? null);
        setCompanies(profile.companies ?? []);
    }, []);

    const refresh = useCallback(async () => {
        if (!getUserApiToken()) {
            clearAuthUserCache();
            applyProfile(null);
            setLoading(false);

            return null;
        }

        setLoading(true);
        inflight = fetchProfile();
        const next = await inflight;
        inflight = null;
        applyProfile(next);
        setLoading(false);

        return next;
    }, [applyProfile]);

    useEffect(() => {
        if (!getUserApiToken()) {
            applyProfile(null);
            setLoading(false);

            return;
        }

        if (cachedUser) {
            applyProfile({
                ...cachedUser,
                current_company: cachedCurrentCompany,
                companies: cachedCompanies,
            });

            return;
        }

        void refresh();
    }, [applyProfile, refresh]);

    const logout = useCallback(async () => {
        try {
            if (getUserApiToken()) {
                await userApiPost('/auth/user-logout', {});
            }
        } catch {
            // ignore
        } finally {
            setUserApiToken(null);
            clearAuthUserCache();
            applyProfile(null);
        }
    }, [applyProfile]);

    return {
        user,
        currentCompany,
        companies,
        loading,
        isLoggedIn: Boolean(user),
        refresh,
        logout,
    };
}
