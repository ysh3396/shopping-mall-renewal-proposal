import { redirect } from "next/navigation";
import Header from "@/components/storefront/Header";
import Navigation from "@/components/storefront/Navigation";
import Footer from "@/components/storefront/Footer";
import { customerAuth } from "@/lib/customer-auth";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Second defense layer: verify ageVerified claim in session
  // (Middleware only checks cookie existence)
  const session = await customerAuth() as {
    user?: { name?: string | null; ageVerified?: boolean };
  } | null;

  if (!session?.user?.ageVerified) {
    redirect("/auth/gate");
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header customerName={session.user.name} />
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
