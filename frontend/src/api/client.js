import axios from "axios";
import { supabase } from "../lib/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attaches the current Supabase session's access token, if any, to every
// request. The backend treats this as optional identification (guests are
// still allowed through) except on routes that explicitly require it.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";

export default api;
