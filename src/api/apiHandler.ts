import axios, { AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';

import { createAuthData } from '../utils/authUtils';

let accessToken: string | null = null;
let refreshToken: string | null = null;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const subscribers: {
    reject: (err: any) => void;
    resolve: () => void;
}[] = [];

const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';

const profile = Updates.channel;
const apiUrl =
    !profile || ['test', 'development'].includes(profile)
        ? process.env.API_DEV_URL
        : process.env.API_URL;

const requestRefreshTokens = async (
    refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
    const data = await createAuthData({ refreshToken });
    return (
        await axios({
            data,
            headers: {
                'Content-Type': 'application/json',
            },
            method: 'POST',
            timeout: 10000,
            url: `${apiUrl}/auth/auth/refresh`,
        })
    ).data;
};

export const removeAccessToken = async (): Promise<void> => {
    accessToken = null;
    await SecureStore.deleteItemAsync(ACCESS_TOKEN);
};

export const removeRefreshToken = async (): Promise<void> => {
    refreshToken = null;
    await SecureStore.deleteItemAsync(REFRESH_TOKEN);
};

export const setAccessToken = async (token: string): Promise<void> => {
    accessToken = token;
    await SecureStore.setItemAsync(ACCESS_TOKEN, token);
};

export const setRefreshToken = async (token: string): Promise<void> => {
    refreshToken = token;
    await SecureStore.setItemAsync(REFRESH_TOKEN, token);
};

export const loadTokens = async (): Promise<void> => {
    const savedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN);
    if (savedAccessToken) accessToken = savedAccessToken;

    const savedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);
    if (savedRefreshToken) refreshToken = savedRefreshToken;
};

function subscribeTokenRefresh(): Promise<void> {
    return new Promise((resolve, reject) => {
        subscribers.push({ reject, resolve });
    });
}

function onRefreshed() {
    subscribers.forEach(({ resolve }) => resolve());
    subscribers.length = 0;
}

function onRefreshFailed(error: any) {
    subscribers.forEach(({ reject }) => reject(error));
    subscribers.length = 0;
}

const getAPIError = (message: string, status: number) => {
    const error: any = new Error(message);
    error.response = { status };
    return error;
};

const refreshAccessToken = async (): Promise<void> => {
    if (isRefreshing && refreshPromise) return refreshPromise;
    if (!refreshToken) throw getAPIError('No refresh token provided.', 401);

    isRefreshing = true;

    refreshPromise = (async () => {
        try {
            const response = await requestRefreshTokens(refreshToken);
            await setAccessToken(response.accessToken);
            await setRefreshToken(response.refreshToken);
            onRefreshed();
        } catch (error) {
            console.error('Error with refreshing token:', error);
            onRefreshFailed(error);
            throw getAPIError('Cannot refresh token', 401);
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

export const apiCall = async <T>(
    options: {
        data?: object | string;
        method: string;
        url: string;
    },
    refreshed: boolean = false,
    timeout?: number,
): Promise<T> => {
    // console.log("Calling API:", options.method, `${getBaseURL()}${options.url}`, options.data);

    if (!accessToken) {
        await loadTokens();
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
    }

    try {
        const fullUrl = `${apiUrl}${options.url}`;

        const axiosConfig: AxiosRequestConfig = {
            headers,
            method: options.method,
            timeout,
            url: fullUrl,
        };

        if (
            options.data &&
            typeof options.data === 'object' &&
            Object.keys(options.data).length > 0
        ) {
            axiosConfig.data = options.data;
        } else if (options.data && typeof options.data === 'string') {
            axiosConfig.data = options.data;
        }

        return (await axios(axiosConfig)).data;
    } catch (error: any) {
        if (error.response?.status === 401) {
            if (refreshed) throw getAPIError('Unauthorized', 401);
            isRefreshing ? await subscribeTokenRefresh() : await refreshAccessToken();
            return apiCall(options, true);
        }

        throw error;
    }
};
