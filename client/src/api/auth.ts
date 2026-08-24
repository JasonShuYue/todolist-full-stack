import { assertOk } from "./errors";
import { setAuthToken } from "./todos";

const AUTH_USER_KEY = "todo_auth_user";

export type AuthUser = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type LoginResponse = {
  user: AuthUser;
  token: string;
};

export function getAuthUser() {
  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthUser() {
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export async function login(email: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  await assertOk(response, "Invalid email or password");

  const data = (await response.json()) as LoginResponse;

  setAuthToken(data.token);
  setAuthUser(data.user);

  return data.user;
}

export async function register(email: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  await assertOk(response, "Failed to register");
}
