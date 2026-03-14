import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "NextGen AI Debt Recovery Platform",
  description:
    "AI-powered digital debt collection platform focused on machine learning, automated communications, respectful consumer experiences, and compliant recovery workflows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
