import { ApisauceInstance, create } from 'apisauce';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';

import { createAuthData } from '../utils/authUtils';
import { decodeJwtExpiry } from '../utils/jwt-utils';

const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';
const REFRESH_TIMEOUT_MS = 10000;
const EXPIRY_LEEWAY_MS = 5000;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Endpoints that must never trigger a pre-emptive refresh: the login endpoints run before any
// session exists, and the refresh endpoint itself must not try to refresh in the middle of refreshing.
const SKIP_REFRESH_PATHS = ['/auth/login/', '/auth/auth/refresh', '/auth/auth/logout'];

const profile = Constants.expoConfig?.extra?.appVariant ?? Updates.channel;
const apiUrl =
    !profile || ['test', 'development'].includes(profile)
        ? process.env.API_DEV_URL
        : process.env.API_URL;

class Api {
    apisauce: ApisauceInstance;

    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    private refreshPromise: Promise<void> | null = null;
    private unauthorizedPromise: Promise<void> | null = null;
    private onUnauthorized: (() => void) | null = null;

    constructor() {
        this.apisauce = create({
            baseURL: apiUrl,
            headers: JSON_HEADERS,
        });

        // Pre-emptive refresh: checked before every request, so a request never goes out with
        // a stale token and we never need to retry-after-401. A 401 can still happen (token
        // revoked server-side before its exp), handled below as a plain logout, not a retry.
        this.apisauce.addAsyncRequestTransform(async request => {
            if (SKIP_REFRESH_PATHS.some(path => request.url?.includes(path))) return;

            if (!this.accessToken) await this.loadTokens();
            if (this.accessToken && this.isTokenExpired(this.accessToken)) {
                await this.refreshAccessToken().catch(() => undefined);
            }

            if (this.accessToken) {
                request.headers = request.headers ?? {};
                request.headers.Authorization = `Bearer ${this.accessToken}`;
            }
        });

        this.apisauce.addAsyncResponseTransform(async response => {
            if (response.ok || response.status !== 401) return;
            await this.handleUnauthorized();
        });
    }

    setOnUnauthorized = (callback: (() => void) | null): void => {
        this.onUnauthorized = callback;
    };

    removeAccessToken = async (): Promise<void> => {
        this.accessToken = null;
        await SecureStore.deleteItemAsync(ACCESS_TOKEN);
    };

    removeRefreshToken = async (): Promise<void> => {
        this.refreshToken = null;
        await SecureStore.deleteItemAsync(REFRESH_TOKEN);
    };

    setAccessToken = async (token: string): Promise<void> => {
        this.accessToken = token;
        await SecureStore.setItemAsync(ACCESS_TOKEN, token);
    };

    setRefreshToken = async (token: string): Promise<void> => {
        this.refreshToken = token;
        await SecureStore.setItemAsync(REFRESH_TOKEN, token);
    };

    loadTokens = async (): Promise<void> => {
        const savedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN);
        if (savedAccessToken) this.accessToken = savedAccessToken;

        const savedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);
        if (savedRefreshToken) this.refreshToken = savedRefreshToken;
    };

    private isTokenExpired(token: string): boolean {
        const expiryMs = decodeJwtExpiry(token);
        return expiryMs === null || expiryMs - EXPIRY_LEEWAY_MS <= Date.now();
    }

    private requestRefreshTokens = async (
        rt: string,
    ): Promise<{ accessToken: string; refreshToken: string }> => {
        const data = await createAuthData({ refreshToken: rt });
        const response = await this.apisauce.axiosInstance.request({
            data,
            headers: JSON_HEADERS,
            method: 'POST',
            timeout: REFRESH_TIMEOUT_MS,
            url: `${apiUrl}/auth/auth/refresh`,
        });
        return response.data;
    };

    private refreshAccessToken = async (): Promise<void> => {
        if (this.refreshPromise) return this.refreshPromise;
        if (!this.refreshToken) throw new Error('No refresh token provided.');

        this.refreshPromise = (async () => {
            try {
                const response = await this.requestRefreshTokens(this.refreshToken!);
                await this.setAccessToken(response.accessToken);
                await this.setRefreshToken(response.refreshToken);
            } catch (error) {
                console.error('Error with refreshing token:', error);
                if (this.isUnauthorizedError(error)) await this.handleUnauthorized();
                throw error;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    };

    private isUnauthorizedError(err: unknown): boolean {
        return (
            typeof err === 'object' &&
            err !== null &&
            'isAxiosError' in err &&
            (err as { response?: { status: number } }).response?.status === 401
        );
    }

    private handleUnauthorized = (): Promise<void> => {
        if (this.unauthorizedPromise) return this.unauthorizedPromise;
        this.unauthorizedPromise = (async () => {
            try {
                await this.removeAccessToken();
                await this.removeRefreshToken();
                this.onUnauthorized?.();
            } finally {
                this.unauthorizedPromise = null;
            }
        })();
        return this.unauthorizedPromise;
    };
}

export { Api };

export const api = new Api();
