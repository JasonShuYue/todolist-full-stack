import { useCallback, useState } from "react";
import type { FormEvent } from "react";

import {
  clearAuthUser,
  getAuthUser,
  login,
  register,
} from "../api/auth";
import { ApiError } from "../api/errors";
import { clearAuthToken, getAuthToken } from "../api/todos";

const initialAuthToken = getAuthToken();
const initialAuthUser = getAuthUser();

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => initialAuthToken !== null && initialAuthUser !== null,
  );
  const [currentUser, setCurrentUser] = useState(initialAuthUser);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleUnauthorized = useCallback(() => {
    clearAuthToken();
    clearAuthUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoggingIn) {
      return;
    }

    setIsLoggingIn(true);
    setAuthError("");

    try {
      if (authMode === "register") {
        await register(email, password);
      }

      const user = await login(email, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      if (error instanceof ApiError && error.requestId !== undefined) {
        console.error("API error", {
          code: error.code,
          message: error.message,
          requestId: error.requestId,
        });
      }

      setAuthError(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout() {
    handleUnauthorized();
  }

  function toggleAuthMode() {
    setAuthError("");
    setAuthMode((currentMode) =>
      currentMode === "login" ? "register" : "login",
    );
  }

  return {
    authError,
    authMode,
    currentUser,
    email,
    isAuthenticated,
    isLoggingIn,
    password,
    handleAuthSubmit,
    handleLogout,
    handleUnauthorized,
    setEmail,
    setPassword,
    toggleAuthMode,
  };
}
