import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';

import { createAuthData } from '../utils/authUtils';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenVersion = 0;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const subscribers: {
    reject: (err: any) => void;
    resolve: () => void;
}[] = [];

const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';
const REFRESH_TIMEOUT_MS = 10000;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const profile = Updates.channel;
const apiUrl =
    !profile || ['test', 'development'].includes(profile)
        ? process.env.API_DEV_URL
        : process.env.API_URL;
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (callback: (() => void) | null): void => {
    onUnauthorized = callback;
};

const requestRefreshTokens = async (
    rt: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
    const data = await createAuthData({ refreshToken: rt });
    return (
        await axios({
            data,
            headers: JSON_HEADERS,
            method: 'POST',
            timeout: REFRESH_TIMEOUT_MS,
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
    tokenVersion++;
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

const refreshAccessToken = async (): Promise<void> => {
    if (isRefreshing && refreshPromise) return refreshPromise;
    if (!refreshToken) throw new Error('No refresh token provided.');

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
            throw error;
        } finally {
            isRefreshing = false;
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

type VersionedRequest = InternalAxiosRequestConfig & { _tokenVersion?: number };

const retriedRequests = new WeakSet<InternalAxiosRequestConfig>();

const isNetworkError = (err: unknown): boolean =>
    axios.isAxiosError(err) && err.code === AxiosError.ERR_NETWORK;

const handleUnauthorized = async (): Promise<void> => {
    await removeAccessToken();
    await removeRefreshToken();
    onUnauthorized?.();
};

export const api: AxiosInstance = axios.create({
    baseURL: apiUrl,
    headers: JSON_HEADERS,
});

api.interceptors.request.use(async config => {
    if (!accessToken) await loadTokens();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    (config as VersionedRequest)._tokenVersion = tokenVersion;
    return config;
});

api.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as VersionedRequest | undefined;

        if (error.response?.status !== 401 || !originalRequest) {
            return Promise.reject(error);
        }

        if (retriedRequests.has(originalRequest)) {
            await handleUnauthorized();
            return Promise.reject(error);
        }
        retriedRequests.add(originalRequest);

        if (originalRequest._tokenVersion !== tokenVersion) {
            return api(originalRequest);
        }

        try {
            if (isRefreshing) await subscribeTokenRefresh();
            else await refreshAccessToken();
        } catch (refreshError) {
            if (isNetworkError(refreshError)) {
                return Promise.reject(refreshError);
            }
            await handleUnauthorized();
            return Promise.reject(error);
        }

        return api(originalRequest);
    },
);
