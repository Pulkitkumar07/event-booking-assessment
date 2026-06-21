import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4100/api",
  withCredentials: true
});

export function getApiErrorMessage(error, fallback) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? fallback;
  }

  return fallback;
}
