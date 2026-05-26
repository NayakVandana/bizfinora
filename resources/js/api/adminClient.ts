import { getAdminApiToken, getUserApiToken } from '@/auth/authToken';
import axios, { isAxiosError } from 'axios';
import type { ApiEnvelope } from './apiClient';

function adminHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const token = getAdminApiToken() ?? getUserApiToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

export async function adminApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    const res = await axios.post<T>(`/api/v1/admin${path}`, data, {
        headers: adminHeaders(),
    });

    return res.data;
}

export function isAdminApiUnauthorized(error: unknown): boolean {
    return isAxiosError(error) && error.response?.status === 401;
}

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type { ApiEnvelope };
