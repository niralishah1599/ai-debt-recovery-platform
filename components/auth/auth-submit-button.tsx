"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  variant?: "primary" | "secondary";
};

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "primary",
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={variant === "primary" ? "button" : "button-secondary"}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
