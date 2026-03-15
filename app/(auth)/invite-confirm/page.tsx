"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function InviteConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Activating your account...");

  useEffect(() => {
    async function handleInvite() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // Read hash params from the invite link
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        // Try PKCE code flow via query params as fallback
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus("Error: " + error.message);
            setTimeout(() => router.push("/login?error=" + encodeURIComponent(error.message)), 2000);
            return;
          }
          router.push("/set-password");
          return;
        }

        setStatus("Invalid invite link.");
        setTimeout(() => router.push("/login?error=" + encodeURIComponent("Invalid invite link.")), 2000);
        return;
      }

      // Set session using tokens from hash
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        setStatus("Error: " + error.message);
        setTimeout(() => router.push("/login?error=" + encodeURIComponent(error.message)), 2000);
        return;
      }

      // Create portal_users record via API
      if (data.user) {
        await fetch("/api/auth/finalize-invite", { method: "POST" });
      }

      setStatus("Account activated! Setting up your portal...");
      router.push("/set-password");
    }

    handleInvite();
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--surface)",
      }}
    >
      <div className="panel panel-body" style={{ maxWidth: "400px", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
        <p className="body-copy">{status}</p>
      </div>
    </div>
  );
}
