import Header from "@/components/storefront/Header";
import Navigation from "@/components/storefront/Navigation";
import Footer from "@/components/storefront/Footer";
import { SessionProvider } from "next-auth/react";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SessionProvider>
  );
}
