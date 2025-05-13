import * as SecureStore from "expo-secure-store";
import axios, { AxiosResponse } from "axios";

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

export const apiCall = async <T>(
  options: { method: string; url: string; data?: object | string }, refreshed: boolean = false,): Promise<T> => {
  console.log('Calling API:', options.method, `${baseURL}${options.url}`, options.data);

  if (!accessToken) {
    await loadTokens();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken && (!options.url.startsWith('/auth') || options.url.includes('logout'))) {
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
      throw new Error('Nieautoryzowany – accessToken wygasł lub jest nieprawidłowy.');
    }

    throw new Error(`API error: ${error.response?.status || error.message}`);
  }
};