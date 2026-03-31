import { getSiteConfig } from "./actions";
import CheckoutClient from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const config = await getSiteConfig();

  return (
    <CheckoutClient
      bankName={config?.bankName ?? ""}
      bankAccount={config?.bankAccount ?? ""}
      bankHolder={config?.bankHolder ?? ""}
      freeShippingThreshold={config?.freeShippingThreshold ?? 50000}
      defaultShippingFee={config?.defaultShippingFee ?? 2500}
    />
  );
}
