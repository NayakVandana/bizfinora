import { getUserApiToken } from '@/auth/authToken';
import axios from 'axios';
import type { ApiEnvelope } from './apiClient';

function companyHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
        Accept: 'application/json',
    };

    const token = getUserApiToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

export async function companyApiPost<T>(
    path: string,
    data: Record<string, unknown> = {},
): Promise<T> {
    const res = await axios.post<T>(`/api/v1/company${path}`, data, {
        headers: companyHeaders(),
    });

    return res.data;
}

export type { ApiEnvelope };
