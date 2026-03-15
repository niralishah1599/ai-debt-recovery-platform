import { createAdminClient } from "@/lib/supabase/admin";
import { requirePortalRole } from "@/services/auth-service";
import { ensurePortalUserProfileForUser } from "@/services/portal-user-service";

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "Temp@";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function inviteDebtorByEmail(
  email: string,
  name: string,
  debtorId: string,
  clientId: string,
): Promise<string> {
  await requirePortalRole("staff");

  const admin = createAdminClient();
  const tempPassword = generateTempPassword();

  // Check if auth user already exists
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  let userId: string;

  if (existing) {
    // Update existing user metadata and reset password
    const { error } = await admin.auth.admin.updateUserById(existing.id, {
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: "debtor", debtor_id: debtorId, client_id: clientId },
    });
    if (error) throw new Error(`Unable to update debtor auth user: ${error.message}`);
    userId = existing.id;
  } else {
    // Create new auth user
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: "debtor", debtor_id: debtorId, client_id: clientId },
    });
    if (error) throw new Error(`Unable to create debtor auth user: ${error.message}`);
    userId = data.user.id;
  }

  // Create portal_users record
  await ensurePortalUserProfileForUser(userId, email, "debtor", clientId, debtorId);

  // Send welcome email with temp password via Supabase invite template
  await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      role: "debtor",
      debtor_id: debtorId,
      client_id: clientId,
      temp_password: tempPassword,
    },
  }).catch(() => {
    // Ignore invite errors — user already created with password above
  });

  return tempPassword;
}
