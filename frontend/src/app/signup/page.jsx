"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { api, getApiErrorMessage } from "@/lib/axios";
import { setUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      role: "user"
    }
  });

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, router, user]);

  async function onSubmit(formData) {
    setError("");

    try {
      const response = await api.post("/auth/signup", formData);
      dispatch(setUser(response.data.user));
      router.push("/");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Signup failed"));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Join BookIt</p>
        <h1>Create your account</h1>
        <p className="form-intro">
          Browse events as a user or create them as an organizer.
        </p>

        {error && <p className="form-error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label>
            Name
            <input
              autoComplete="name"
              type="text"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters"
                }
              })}
            />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </label>

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
              autoComplete="new-password"
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

          <label>
            Account type
            <select {...register("role")}>
              <option value="user">User — browse and book events</option>
              <option value="organizer">Organizer — create events too</option>
            </select>
          </label>

          <button
            className="button button-primary"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
