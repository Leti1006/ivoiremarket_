import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ExternalLink } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { listProductImages } from "@/data/product-images";
import { AdminPageHeader, AdminSkeleton } from "@/features/admin/components/admin-ui";
import { DeleteProductButton } from "@/features/admin/components/delete-product-button";
import { ProductForm } from "@/features/admin/components/product-form";
import { findProductById } from "@/server/products-repo";
import { requireAdmin } from "@/server/session";

export const metadata = { title: "Modifier un produit" };

export default function EditProductPage({ params }: PageProps<"/admin/produits/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/admin/produits/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const product = findProductById(id);
  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        title="Modifier le produit"
        description={`${product.id} · ${product.name}`}
        actions={
          <>
            <Link href={`/produits/${product.slug}`} target="_blank" className={buttonClasses({ variant: "outline" })}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Voir dans la boutique
            </Link>
            <DeleteProductButton id={product.id} name={product.name} />
          </>
        }
      />
      <ProductForm product={product} images={listProductImages()} />
    </>
  );
}
