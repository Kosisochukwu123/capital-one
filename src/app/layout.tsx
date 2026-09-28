import type { Metadata } from "next";
import "./globals.css";

import { LoadingProvider } from "@/components/feedback/loading-provider";

export const metadata: Metadata = {
  title: "Northstar Banking",
  description: "Educational online banking simulation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LoadingProvider>{children}</LoadingProvider>
      </body>
    </html>
  );
}