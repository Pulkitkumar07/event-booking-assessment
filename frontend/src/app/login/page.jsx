"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api, getApiErrorMessage } from "@/lib/axios";
import { setUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  async function onSubmit(formData) {
    setError("");

    try {
      const response = await api.post("/auth/login", formData);
      dispatch(setUser(response.data.user));
      router.push("/");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Login failed"));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to BookIt</h1>
        <p className="form-intro">Manage your bookings and events.</p>

        {error && <p className="form-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Email
            <input
              autoComplete="email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email"
                }
              })}
            />
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </label>

          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
            />
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </label>

          <button
            className="button button-primary"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New to BookIt? <Link href="/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
