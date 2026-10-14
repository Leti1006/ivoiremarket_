import { Suspense } from "react";
import { listProductImages } from "@/data/product-images";
import { AdminPageHeader, AdminSkeleton } from "@/features/admin/components/admin-ui";
import { ProductForm } from "@/features/admin/components/product-form";
import { requireAdmin } from "@/server/session";

export const metadata = { title: "Nouveau produit" };

export default function NewProductPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader title="Nouveau produit" description="Le produit apparaît dans la boutique dès son enregistrement." />
      <ProductForm images={listProductImages()} />
    </>
  );
}
