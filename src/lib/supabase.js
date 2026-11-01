
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

console.log("Supabase URL loaded:", Boolean(url));
console.log("Supabase URL format looks valid:", Boolean(
  url && /^https?:\/\/.+/.test(url)
));
console.log("Supabase key loaded:", Boolean(anonKey));

export const supabase =
  url && anonKey ? createClient(url, anonKey) : null;

export const isDemoMode = !supabase;
