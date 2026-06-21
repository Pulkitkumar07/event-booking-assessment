"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/axios";
import { clearUser } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await api.post("/auth/logout");
      dispatch(clearUser());
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="site-header">
      <nav className="nav-container" aria-label="Main navigation">
        <Link className="brand" href="/">
          BookIt
        </Link>

        <div className="nav-links">
          <Link href="/events">Events</Link>

          {!loading && user && (
            <>
              <Link href="/bookings">My bookings</Link>
              {user.role === "ORGANIZER" && (
                <Link href="/organizer">Organizer</Link>
              )}
              <span className="nav-user">Hi, {user.name}</span>
              <button
                className="button button-secondary button-small"
                disabled={loggingOut}
                onClick={handleLogout}
                type="button"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          )}

          {!loading && !user && (
            <>
              <Link href="/login">Login</Link>
              <Link className="button button-primary button-small" href="/signup">
                Create account
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
