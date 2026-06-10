import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PO OS",
  description: "Personal Product Operating System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
