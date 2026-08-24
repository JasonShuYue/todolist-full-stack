import type { FormEvent } from "react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  authError: string;
  authMode: AuthMode;
  email: string;
  isSubmitting: boolean;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleMode: () => void;
};

export function AuthForm({
  authError,
  authMode,
  email,
  isSubmitting,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}: AuthFormProps) {
  return (
    <>
      <form className="auth-form" onSubmit={onSubmit}>
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="Email"
          disabled={isSubmitting}
        />
        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="Password"
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? authMode === "login"
              ? "Logging in..."
              : "Creating account..."
            : authMode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>

      <button type="button" className="auth-mode-button" onClick={onToggleMode}>
        {authMode === "login"
          ? "Create a new account"
          : "Log in with an existing account"}
      </button>

      {authError && <p className="error-message">{authError}</p>}
    </>
  );
}
