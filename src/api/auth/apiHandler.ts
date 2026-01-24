import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { refreshTokens } from "../apiClient";
import * as Updates from 'expo-updates';

let accessToken: string | null = null;
let refreshToken: string | null = null;

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;
const subscribers: {
  resolve: () => void;
  reject: (err: any) => void;
}[] = [];

const ACCESS_TOKEN = "accessToken";
const REFRESH_TOKEN = "refreshToken";

const profile = Updates.channel;
const apiUrl = 'http:192.168.1.15:3000'

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
    subscribers.push({ resolve, reject });
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
  error.response = { status: status };
  return error;
}

const refreshAccessToken = async (): Promise<void> => {
  if (isRefreshing && refreshPromise) return refreshPromise;
  if (!refreshToken) throw getAPIError('No refresh token provided.', 401);

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const response = await refreshTokens(refreshToken);
      await setAccessToken(response.accessToken);
      await setRefreshToken(response.refreshToken);
      onRefreshed();
    } catch (error) {
      console.error("Error with refreshing token:", error);
      await removeAccessToken();
      await removeRefreshToken();
      onRefreshFailed(error);
      throw getAPIError("Cannot refresh token", 401);
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
  // console.log("Calling API:", options.method, `${getBaseURL()}${options.url}`, options.data);

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
    const fullUrl = `${apiUrl}${options.url}`;

    const axiosConfig: any = {
      method: options.method,
      url: fullUrl,
      headers,
    };

    if (options.data && typeof options.data === 'object' && Object.keys(options.data).length > 0) {
      axiosConfig.data = options.data;
    } else if (options.data && typeof options.data === 'string') {
      axiosConfig.data = options.data;
    }

    return (await axios(axiosConfig)).data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      if (!refreshed) {
        if (isRefreshing) {
          await subscribeTokenRefresh();
        } else {
          await refreshAccessToken();
        }
        return apiCall(options, true);
      } else {
        throw getAPIError('Unathorized', 401);
      }
    }

    throw new Error(`API error: ${error.response?.status || error.message}`);
  }
};