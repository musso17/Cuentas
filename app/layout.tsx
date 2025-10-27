import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Balance Compartido",
  description: "A modern, simple, and elegant platform for couples to manage their joint finances.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}