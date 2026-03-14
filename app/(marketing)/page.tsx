import { redirect } from "next/navigation";

import { getCurrentAuthUser } from "@/services/auth-service";

export default async function HomePage() {
  const user = await getCurrentAuthUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
