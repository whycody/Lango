import { ApisauceInstance, create } from 'apisauce';
import { AxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';

import { createAuthData } from '../utils/authUtils';

declare module 'axios' {
    interface AxiosRequestConfig {
        _retried?: boolean;
        _skipAuthRefresh?: boolean;
        _tokenVersion?: number;
    }
}

const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';
const REFRESH_TIMEOUT_MS = 10000;
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const profile = Constants.expoConfig?.extra?.appVariant ?? Updates.channel;
const apiUrl =
    !profile || ['test', 'development'].includes(profile)
        ? process.env.API_DEV_URL
        : process.env.API_URL;

export const SKIP_REFRESH: AxiosRequestConfig = { _skipAuthRefresh: true };

class Api {
    apisauce: ApisauceInstance;

    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenVersion = 0;

    private isRefreshing = false;
    private refreshPromise: Promise<void> | null = null;
    private unauthorizedPromise: Promise<void> | null = null;
    private onUnauthorized: (() => void) | null = null;

    private readonly subscribers: {
        reject: (err: any) => void;
        resolve: () => void;
    }[] = [];

    constructor() {
        this.apisauce = create({
            baseURL: apiUrl,
            headers: JSON_HEADERS,
        });

        this.apisauce.addAsyncRequestTransform(async request => {
            if (!this.accessToken) await this.loadTokens();
            if (this.accessToken) {
                request.headers = request.headers ?? {};
                request.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            request._tokenVersion = this.tokenVersion;
        });

        this.apisauce.addAsyncResponseTransform(async response => {
            if (response.ok) return;

            const originalRequest = response.config;

            if (
                response.status !== 401 ||
                !originalRequest ||
                originalRequest._skipAuthRefresh ||
                originalRequest._retried
            ) {
                return;
            }

            originalRequest._retried = true;

            if (originalRequest._tokenVersion !== this.tokenVersion) {
                await this.retryOriginalRequest(response, originalRequest);
                return;
            }

            try {
                if (this.isRefreshing) await this.subscribeTokenRefresh();
                else await this.refreshAccessToken();
            } catch (refreshError) {
                if (this.isNetworkError(refreshError)) return;

                if (this.isAxiosLikeError(refreshError) && refreshError.response?.status === 401) {
                    await this.handleUnauthorized();
                }

                return;
            }

            await this.retryOriginalRequest(response, originalRequest);
        });
    }

    // apisauce's async response transform mutates the passed-in ApiResponse in place rather
    // than letting us return a replacement, so a retried request is re-issued on the underlying
    // axios instance and its result is copied onto the original response object.
    private async retryOriginalRequest(
        response: any,
        originalRequest: AxiosRequestConfig,
    ): Promise<void> {
        try {
            const retried = await this.apisauce.axiosInstance.request(originalRequest);
            response.ok = true;
            response.problem = null;
            response.originalError = null;
            response.data = retried.data;
            response.status = retried.status;
            response.headers = retried.headers;
        } catch (error: any) {
            if (error?.response) {
                response.ok = false;
                response.problem = 'CLIENT_ERROR';
                response.originalError = error;
                response.data = error.response.data;
                response.status = error.response.status;
                response.headers = error.response.headers;
            }
        }
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
        this.tokenVersion++;
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

    private subscribeTokenRefresh(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.subscribers.push({ reject, resolve });
        });
    }

    private onRefreshed() {
        this.subscribers.forEach(({ resolve }) => resolve());
        this.subscribers.length = 0;
    }

    private onRefreshFailed(error: any) {
        this.subscribers.forEach(({ reject }) => reject(error));
        this.subscribers.length = 0;
    }

    private requestRefreshTokens = async (
        rt: string,
    ): Promise<{ accessToken: string; refreshToken: string }> => {
        const data = await createAuthData({ refreshToken: rt });
        const response = await this.apisauce.axiosInstance.request({
            _skipAuthRefresh: true,
            data,
            headers: JSON_HEADERS,
            method: 'POST',
            timeout: REFRESH_TIMEOUT_MS,
            url: `${apiUrl}/auth/auth/refresh`,
        });
        return response.data;
    };

    private refreshAccessToken = async (): Promise<void> => {
        if (this.isRefreshing && this.refreshPromise) return this.refreshPromise;
        if (!this.refreshToken) throw new Error('No refresh token provided.');

        this.isRefreshing = true;

        this.refreshPromise = (async () => {
            try {
                const response = await this.requestRefreshTokens(this.refreshToken!);
                await this.setAccessToken(response.accessToken);
                await this.setRefreshToken(response.refreshToken);
                this.onRefreshed();
            } catch (error) {
                console.error('Error with refreshing token:', error);
                this.onRefreshFailed(error);
                throw error;
            } finally {
                this.isRefreshing = false;
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    };

    private isNetworkError(err: unknown): boolean {
        if (!this.isAxiosLikeError(err)) return false;
        return err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || !err.response;
    }

    private isAxiosLikeError(err: unknown): err is { code?: string; response?: { status: number } } {
        return typeof err === 'object' && err !== null && 'isAxiosError' in err;
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
