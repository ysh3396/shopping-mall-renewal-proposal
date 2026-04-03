import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireCustomerAuth() {
  const session = await auth();

  const user = session?.user as {
    id?: string;
    userType?: "admin" | "customer";
  } | undefined;

  if (!user?.id || user.userType !== "customer") {
    redirect("/login");
  }

  return { id: user.id };
}
