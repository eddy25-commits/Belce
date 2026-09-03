// Vercel serverless function entry point. Vercel auto-detects any file
// under a top-level /api directory and deploys it as a function — this
// file just re-exports the same Express app used for local dev
// (backend/app.js), so all the actual route/business logic lives in one
// place. vercel.json rewrites every /api/* request to this function while
// preserving the original path, so Express's own routing (app.use("/api/products", ...)
// etc.) still works exactly as it does locally.
module.exports = require("../backend/app");
