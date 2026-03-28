import * as SecureStore from "expo-secure-store";

// Change this to your production URL when deploying
const BASE_URL = __DEV__
  ? "http://192.168.1.3:3000" // Replace with your local IP
  : "https://www.bshababha-rabt.tech"; // Replace with your production URL

const TOKEN_KEY = "admin_token";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    // NextAuth expects the token as a cookie, but for mobile we send as Bearer
    headers["Authorization"] = `Bearer ${token}`;
    // Also set as cookie for NextAuth compatibility
    headers["Cookie"] = `next-auth.session-token=${token}`;
  }

  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    await removeToken();
    throw new Error("UNAUTHORIZED");
  }

  const text = await res.text();

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error(`خطأ في الاتصال بالخادم (${res.status})`);
  }

  if (!res.ok) {
    throw new Error((data as Record<string, string>).message || (data as Record<string, string>).error || "حدث خطأ");
  }

  return data;
}
