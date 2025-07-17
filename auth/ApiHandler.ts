import * as SecureStore from "expo-secure-store";
import axios, { AxiosResponse } from "axios";
import { refreshTokens } from "../hooks/useApi";

let accessToken: string | null = null;
let refreshToken: string | null = null;

const ACCESS_TOKEN = 'accessToken';
const REFRESH_TOKEN = 'refreshToken';

const baseURL = process.env['API_URL'];

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

  if (savedAccessToken) {
    accessToken = savedAccessToken;
  }

  const savedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN);

  if (savedRefreshToken) {
    refreshToken = savedRefreshToken;
  }
};

const refreshAccessToken = async (): Promise<void> => {
  if (!refreshToken) {
    throw new Error('Brak tokenu odświeżającego.');
  }

  try {
    const response = await refreshTokens(refreshToken);
    await setAccessToken(response.accessToken);
    await setRefreshToken(response.refreshToken);
  } catch (error) {
    console.error('Błąd podczas odświeżania tokena:', error);
    throw new Error('Nie można odświeżyć tokena.');
  }
}

export const apiCall = async <T>(
  options: { method: string; url: string; data?: object | string }, refreshed: boolean = false,): Promise<T> => {
  console.log('Calling API:', options.method, `${baseURL}${options.url}`, options.data);

  if (!accessToken) {
    await loadTokens();
  }

  // console.log('Access Token:', accessToken);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response: AxiosResponse<T> = await axios({
      method: options.method,
      url: `${baseURL}${options.url}`,
      headers,
      data: options.data,
      timeout: 2000,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (!refreshed) {
        await refreshAccessToken();
        return apiCall(options, true);
      } else {
        throw new Error('Nieautoryzowany – accessToken wygasł lub jest nieprawidłowy.');
      }
    }

    throw new Error(`API error: ${error.response?.status || error.message}`);
  }
};