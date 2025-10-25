import * as SecureStore from "expo-secure-store";
import axios, { AxiosResponse } from "axios";
import { refreshTokens } from "../apiClient";

let accessToken: string | null = null;
let refreshToken: string | null = null;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
const subscribers: (() => void)[] = [];

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

const getBaseURL = () => process.env['API_URL'];

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

function subscribeTokenRefresh(callback: () => void) {
  subscribers.push(callback);
}

function onRefreshed() {
  subscribers.forEach((cb) => cb());
  subscribers.length = 0;
}

const refreshAccessToken = async (): Promise<void> => {
  if (isRefreshing && refreshPromise) return refreshPromise;
  if (!refreshToken) throw new Error("No refresh token provided.");

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const response = await refreshTokens(refreshToken as string);
      await setAccessToken(response.accessToken);
      await setRefreshToken(response.refreshToken);
      onRefreshed();
    } catch (error) {
      console.error("Error with refreshing token:", error);
      await removeAccessToken();
      await removeRefreshToken();
      throw new Error("Cannot refresh token.");
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiCall = async <T>(
  options: {
    method: string;
    url: string;
    data?: object | string;
  },
  refreshed: boolean = false,
  timeout: number = 15000
): Promise<T> => {
  console.log("Calling API:", options.method, `${getBaseURL()}${options.url}`, options.data);

  if (!accessToken) {
    await loadTokens();
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response: AxiosResponse<T> = await axios({
      method: options.method,
      url: `${getBaseURL()}${options.url}`,
      headers,
      data: options.data,
      timeout,
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (!refreshed) {
        if (isRefreshing) {
          await new Promise<void>((resolve) => subscribeTokenRefresh(resolve));
        } else {
          await refreshAccessToken();
        }

        return apiCall(options, true);
      } else {
        throw new Error("Unauthorized");
      }
    }

    throw new Error(`API error: ${error.response?.status || error.message}`);
  }
};