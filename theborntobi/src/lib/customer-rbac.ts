import { customerAuth } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

type CustomerSession = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    ageVerified?: boolean;
  };
};

export async function requireCustomerAuth(): Promise<CustomerSession["user"]> {
  const session = await customerAuth() as CustomerSession | null;

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return session.user;
}

export async function requireAgeVerified(): Promise<CustomerSession["user"]> {
  const user = await requireCustomerAuth();

  if (!user.ageVerified) {
    redirect("/auth/gate");
  }

  return user;
}
