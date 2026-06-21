"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

export default function HomePage() {
  const { user, loading } = useAppSelector((state) => state.auth);

  return (
    <main className="home">
      <section className="hero">
        <p className="eyebrow">BookIt</p>
        <h1>Find your next live event.</h1>
        <p>
          Discover local events, reserve your seat, and keep every booking in
          one place.
        </p>
        <div className="hero-actions">
          {!loading && !user && (
            <>
              <Link className="button button-primary" href="/signup">
                Get started
              </Link>
              <Link className="button button-secondary" href="/login">
                Login
              </Link>
            </>
          )}

          {!loading && user && (
            <>
              <Link className="button button-primary" href="/bookings">
                View my bookings
              </Link>
              {user.role === "ORGANIZER" && (
                <Link className="button button-secondary" href="/organizer">
                  Organizer dashboard
                </Link>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
