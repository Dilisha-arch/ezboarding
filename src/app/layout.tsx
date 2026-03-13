/**
 * src/app/layout.tsx
 * The root layout that wraps every page in the application.
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageTransition from "@/components/shared/PageTransition";
import { Toaster } from "sonner"; // <-- Added Sonner import

// Configure the Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ezboarding | Find Your Perfect Boarding Place",
  description: "The ultimate platform for university students in Sri Lanka to find boarding rooms, hostels, annexes, and houses near their faculties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        {/* Main Page Content */}
        <div className="flex-1 flex flex-col">
          <PageTransition>
            {children}
          </PageTransition>
        </div>

        {/* Global Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}