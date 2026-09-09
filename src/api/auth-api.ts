import { ApiResponse } from 'apisauce';

import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { createAuthData } from '../utils/authUtils';
import { Api, api } from './api';
import {
    AuthTokensResponse,
    DeleteAccountApi,
    SignInWithAppleApi,
    SignInWithFacebookApi,
    SignInWithGoogleApi,
    SignOutApi,
} from './api.types';

const AUTH_API_ROUTES = {
    account: '/auth/auth/account',
    loginApple: '/auth/login/apple',
    loginFacebook: '/auth/login/facebook',
    loginGoogle: '/auth/login/google',
    logout: '/auth/auth/logout',
} as const;

class AuthApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async signInWithGoogle(idToken: string): Promise<SignInWithGoogleApi> {
        const data = await createAuthData({ idToken });
        const response: ApiResponse<AuthTokensResponse> = await this.api.apisauce.post(
            AUTH_API_ROUTES.loginGoogle,
            data,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async signInWithFacebook(accessToken: string): Promise<SignInWithFacebookApi> {
        const data = await createAuthData({ accessToken });
        const response: ApiResponse<AuthTokensResponse> = await this.api.apisauce.post(
            AUTH_API_ROUTES.loginFacebook,
            data,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async signInWithApple(accessToken: string, fullName: string): Promise<SignInWithAppleApi> {
        const data = await createAuthData({ accessToken, fullName });
        const response: ApiResponse<AuthTokensResponse> = await this.api.apisauce.post(
            AUTH_API_ROUTES.loginApple,
            data,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async signOut(): Promise<SignOutApi> {
        const data = await createAuthData();
        const response: ApiResponse<null> = await this.api.apisauce.post(
            AUTH_API_ROUTES.logout,
            data,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }

    async deleteAccount(): Promise<DeleteAccountApi> {
        const response: ApiResponse<null> = await this.api.apisauce.delete(AUTH_API_ROUTES.account);
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }
}

export const authApi = new AuthApi(api);
