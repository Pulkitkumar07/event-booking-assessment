"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { api } from "@/lib/axios";
import { clearUser, finishSessionCheck, setUser } from "./auth-slice";
import { store } from "./store";

function SessionLoader({ children }) {
  useEffect(() => {
    async function loadSession() {
      try {
        const response = await api.get("/auth/me");
        store.dispatch(setUser(response.data.user));
      } catch {
        store.dispatch(clearUser());
      } finally {
        store.dispatch(finishSessionCheck());
      }
    }

    loadSession();
  }, []);

  return children;
}

export function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <SessionLoader>{children}</SessionLoader>
    </Provider>
  );
}
