const asyncHandler = require("express-async-handler");
const { supabaseAdmin } = require("../config/supabase");

const getTokenFromHeader = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }
  return null;
};

// Decodes the bearer token if present and attaches req.user. Never throws —
// use this on routes that behave differently for guests vs. signed-in
// customers (e.g. payment/initialize, which supports guest checkout).
const identify = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return next();

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (!error && data?.user) {
    req.user = data.user;
  }
  next();
});

// Requires a valid, signed-in Supabase user (customer or admin).
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    res.status(401);
    throw new Error("Not authorized, token invalid or expired");
  }

  req.user = data.user;
  next();
});

// Requires a signed-in user flagged as an admin via app_metadata.is_admin
// (set through the seed script / Supabase dashboard — never editable by
// the user themselves, unlike user_metadata).
const requireAdmin = [
  requireAuth,
  (req, res, next) => {
    if (!req.user?.app_metadata?.is_admin) {
      res.status(403);
      throw new Error("Not authorized as an admin");
    }
    next();
  },
];

module.exports = { identify, requireAuth, requireAdmin };
