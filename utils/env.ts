type RequiredEnvironmentKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function getRequiredEnvironmentVariable(key: RequiredEnvironmentKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  supabaseUrl: getRequiredEnvironmentVariable("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: getRequiredEnvironmentVariable(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ),
};
