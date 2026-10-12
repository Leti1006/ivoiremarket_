import type { Metadata } from "next";
import { ConfirmationView } from "@/features/checkout/components/confirmation-view";

export const metadata: Metadata = {
  title: "Confirmation de commande",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <ConfirmationView />
    </div>
  );
}
