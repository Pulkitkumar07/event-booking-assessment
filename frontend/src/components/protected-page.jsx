"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";

export function ProtectedPage({
  children,
  organizerOnly = false
}) {
  const router = useRouter();
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && organizerOnly && user?.role !== "ORGANIZER") {
      router.replace("/");
    }
  }, [loading, organizerOnly, router, user]);

  if (loading || !user || (organizerOnly && user.role !== "ORGANIZER")) {
    return <main className="page-message">Checking your session...</main>;
  }

  return children;
}
