"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const EMPTY: AuthState = {};

export default function LoginForm({ next }: { next: string }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signingIn] = useActionState(signIn, EMPTY);
  const [signUpState, signUpAction, signingUp] = useActionState(signUp, EMPTY);

  const state = mode === "signin" ? signInState : signUpState;
  const pending = mode === "signin" ? signingIn : signingUp;

  return (
    <div className="card card-pad">
      <form action={mode === "signin" ? signInAction : signUpAction} className="form">
        <input type="hidden" name="next" value={next} />

        {state.error ? <div className="notice error">{state.error}</div> : null}
        {state.message ? <div className="notice good">{state.message}</div> : null}

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
          />
          {mode === "signup" ? (
            <p className="hint">At least 8 characters.</p>
          ) : null}
        </div>

        <button className="btn" type="submit" disabled={pending}>
          {pending
            ? mode === "signin"
              ? "Signing in…"
              : "Creating account…"
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <hr className="sep" />

      <p className="small muted" style={{ margin: 0 }}>
        {mode === "signin" ? (
          <>
            First time here?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              style={{
                background: "none", border: 0, padding: 0,
                color: "var(--accent)", cursor: "pointer", font: "inherit",
              }}
            >
              Create your account
            </button>{" "}
            using the email you were invited with.
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("signin")}
              style={{
                background: "none", border: 0, padding: 0,
                color: "var(--accent)", cursor: "pointer", font: "inherit",
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}
