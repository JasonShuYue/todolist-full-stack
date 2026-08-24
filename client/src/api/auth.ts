import { setAuthToken } from "./todos";

type AuthUser = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type LoginResponse = {
  user: AuthUser;
  token: string;
};

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

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  const data = (await response.json()) as LoginResponse;

  setAuthToken(data.token);

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

  if (!response.ok) {
    throw new Error("Failed to register");
  }
}
