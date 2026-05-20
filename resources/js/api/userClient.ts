import { getUserApiToken } from '@/auth/authToken';
import axios, { isAxiosError } from 'axios';
import type { ApiEnvelope } from './apiClient';

function userHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const token = getUserApiToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

export async function userApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    const res = await axios.post<T>(`/api/v1/user${path}`, data, {
        headers: userHeaders(),
    });

    return res.data;
}

export function isUserApiUnauthorized(error: unknown): boolean {
    return isAxiosError(error) && error.response?.status === 401;
}

export type { ApiEnvelope };
