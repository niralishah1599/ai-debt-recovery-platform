export type PortalUserRole = "staff" | "client" | "debtor";

export type AuthFormInput = {
  email: string;
  password: string;
};

export type RegistrationFormInput = AuthFormInput & {
  role: PortalUserRole;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);

  if (typeof value !== "string") {
    throw new Error(`Missing form field: ${key}`);
  }

  return value.trim();
}

export function parseLoginForm(formData: FormData): AuthFormInput {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");

  if (!email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  return { email, password };
}

export function parseRegistrationForm(formData: FormData): RegistrationFormInput {
  const role = readString(formData, "role");

  if (role !== "staff" && role !== "client" && role !== "debtor") {
    throw new Error("Select a valid user role.");
  }

  return { ...parseLoginForm(formData), role };
}
