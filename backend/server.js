// Local-dev-only entry point. In production (single Vercel project), the
// same Express app is imported directly by /api/index.js and run as a
// serverless function instead — this file is never used there.
const app = require("./app");

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Belce API running locally on port ${PORT}`);
});
