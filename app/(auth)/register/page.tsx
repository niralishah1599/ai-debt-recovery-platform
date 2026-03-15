import { AuthShell } from "@/components/auth/auth-shell";

import { RegisterForm } from "./register-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const error = resolvedSearchParams?.error;

  return (
    <AuthShell
      alternateHref="/login"
      alternateLabel="Already have an account? Sign in"
      asideBody="Staff accounts get full operations access — clients, debtors, campaigns, compliance, and analytics. Client accounts get a scoped view of their own portfolio performance and payment activity."
      asideTitle="Choosing your role"
      description="Create your account to start managing debt recovery portfolios with AI-assisted outreach and automated compliance."
      title="Create account"
    >
      <RegisterForm error={error} />
    </AuthShell>
  );
}
