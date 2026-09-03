// Run with: npm run seed:admin
// Reads ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD from your .env file.
// Creates a Supabase Auth user flagged as an admin via app_metadata,
// which is what backend/middleware/auth.js checks on protected routes.
require("dotenv").config();
const { supabaseAdmin } = require("../config/supabase");

const run = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Please set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in your .env file first.");
    process.exit(1);
  }

  const email = ADMIN_EMAIL.toLowerCase();

  // Check whether this admin already exists so re-running the script is safe.
  const { data: existingList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to check existing users:", listError.message);
    process.exit(1);
  }
  const existing = existingList.users.find((u) => u.email?.toLowerCase() === email);

  if (existing) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password: ADMIN_PASSWORD,
      app_metadata: { is_admin: true },
    });
    if (updateError) {
      console.error("Failed to update existing admin:", updateError.message);
      process.exit(1);
    }
    console.log(`Existing user ${email} updated and flagged as admin. You can now log in on /admin/login.`);
    process.exit(0);
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: ADMIN_PASSWORD,
    email_confirm: true, // skip the confirmation email for the bootstrap admin
    app_metadata: { is_admin: true },
    user_metadata: { full_name: ADMIN_NAME || "Belce Admin" },
  });

  if (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }

  console.log(`Admin account created for ${data.user.email}. You can now log in on /admin/login.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
