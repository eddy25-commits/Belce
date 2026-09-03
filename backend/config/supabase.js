const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in backend/.env (see .env.example)."
  );
}

// Server-side client using the SERVICE ROLE key. This bypasses Row Level
// Security, so it must NEVER be exposed to the frontend — it only ever
// lives here, on the backend. All product/order/delivery-zone reads and
// writes go through this client.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// A lightweight client using the public ANON key, used only for verifying
// or issuing auth calls that mirror what an anonymous frontend client can
// do (kept separate from supabaseAdmin for clarity).
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

module.exports = { supabaseAdmin, supabasePublic };
