import { ApiResponse } from 'apisauce';

import { LanguageCode } from '../constants/Language';
import { LanguageLevel, LanguageLevelRange, User, UserSummary } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { createAuthData } from '../utils/authUtils';
import { Api, api } from './api';
import {
    FetchUserSummaryApi,
    GetUserInfoApi,
    RegisterDeviceTokenApi,
    UpdateFinishedOnboardingApi,
    UpdateFinishedOnboardingRequest,
    UpdateLanguageLevelsApi,
    UpdateLanguageLevelsRequest,
    UpdateNotificationsEnabledApi,
    UpdateNotificationsEnabledRequest,
    UpdateSuggestionsInSessionApi,
    UpdateSuggestionsInSessionRequest,
    UpdateUserDataApi,
    UpdateUserDataRequest,
} from './api.types';

const USERS_API_ROUTES = {
    finishedOnboarding: '/users/finished-onboarding',
    languageLevels: '/users/language-levels',
    notificationsEnabled: '/notifications',
    registerDeviceToken: '/notifications/devices',
    suggestionsInSession: '/users/suggestions-in-session',
    userData: '/users/data',
    users: '/users/users',
    userSummary: (id: string) => `/users/${id}/summary`,
} as const;

class UsersApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async getUserInfo(timeout = 10000): Promise<GetUserInfoApi> {
        const response: ApiResponse<User | null> = await this.api.apisauce.get(
            USERS_API_ROUTES.users,
            {},
            { timeout },
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: response.data ?? null, kind: 'ok' };
    }

    async fetchUserSummary(id: string): Promise<FetchUserSummaryApi> {
        const response: ApiResponse<UserSummary | null> = await this.api.apisauce.get(
            USERS_API_ROUTES.userSummary(id),
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: response.data ?? null, kind: 'ok' };
    }

    async updateUserData(
        mainLang: LanguageCode,
        translationLang: LanguageCode,
        level: LanguageLevelRange,
        selectedFlashcardsIds: string[],
        skippedFlashcardsIds: string[],
    ): Promise<UpdateUserDataApi> {
        const body: UpdateUserDataRequest = {
            level,
            mainLang,
            selectedFlashcardsIds,
            skippedFlashcardsIds,
            translationLang,
        };
        const response: ApiResponse<null> = await this.api.apisauce.put(
            USERS_API_ROUTES.userData,
            body,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }

    async updateSuggestionsInSession(enabled: boolean): Promise<UpdateSuggestionsInSessionApi> {
        const body: UpdateSuggestionsInSessionRequest = { enabled };
        const response: ApiResponse<null> = await this.api.apisauce.patch(
            USERS_API_ROUTES.suggestionsInSession,
            body,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }

    async updateFinishedOnboarding(finished: boolean): Promise<UpdateFinishedOnboardingApi> {
        const body: UpdateFinishedOnboardingRequest = { finished };
        const response: ApiResponse<null> = await this.api.apisauce.patch(
            USERS_API_ROUTES.finishedOnboarding,
            body,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }

    async updateNotificationsEnabled(enabled: boolean): Promise<UpdateNotificationsEnabledApi> {
        const body: UpdateNotificationsEnabledRequest = { enabled };
        const response: ApiResponse<null> = await this.api.apisauce.patch(
            USERS_API_ROUTES.notificationsEnabled,
            body,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }

    async updateLanguageLevels(languageLevels: LanguageLevel[]): Promise<UpdateLanguageLevelsApi> {
        const body: UpdateLanguageLevelsRequest = { languageLevels };
        const response: ApiResponse<null> = await this.api.apisauce.put(
            USERS_API_ROUTES.languageLevels,
            body,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }

    async registerDeviceToken(token: string): Promise<RegisterDeviceTokenApi> {
        const data = await createAuthData({ token });
        const response: ApiResponse<null> = await this.api.apisauce.post(
            USERS_API_ROUTES.registerDeviceToken,
            data,
        );
        if (!response.ok) return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        return { data: null, kind: 'ok' };
    }
}

export const usersApi = new UsersApi(api);
