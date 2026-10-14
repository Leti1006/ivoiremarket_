import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { Pencil, Plus } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { getCategory } from "@/data/categories";
import { AdminPageHeader, AdminSkeleton, Notice } from "@/features/admin/components/admin-ui";
import { ProductPhoto } from "@/features/products/components/product-photo";
import { normalizeText } from "@/features/products/filters";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { listProducts } from "@/server/products-repo";
import { requireAdmin } from "@/server/session";

export const metadata = { title: "Produits" };

const MESSAGES: Record<string, string> = {
  cree: "Produit créé.",
  modifie: "Produit mis à jour.",
  supprime: "Produit supprimé.",
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function AdminProductsPage({ searchParams }: PageProps<"/admin/produits">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <ProductsTable searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsTable({ searchParams }: Pick<PageProps<"/admin/produits">, "searchParams">) {
  await requireAdmin();
  const params = await searchParams;
  const q = (first(params.q) ?? "").slice(0, 80);
  const stockFilter = first(params.stock);
  const message = MESSAGES[first(params.ok) ?? ""];

  const terms = normalizeText(q).split(/\s+/).filter(Boolean);
  const products = listProducts().filter((p) => {
    if (stockFilter === "rupture" && p.stock > 0) return false;
    if (stockFilter === "faible" && (p.stock === 0 || p.stock > 5)) return false;
    const haystack = normalizeText(`${p.name} ${p.brand} ${p.id}`);
    return terms.every((t) => haystack.includes(t));
  });

  return (
    <>
      <AdminPageHeader
        title="Produits"
        description="Prix, stocks, promotions, photos et mise en avant sur l'accueil."
        actions={
          <Link href="/admin/produits/nouveau" className={buttonClasses()}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau produit
          </Link>
        }
      />
      {message && <Notice>{message}</Notice>}

      <Form action="/admin/produits" className="mb-4 flex flex-wrap gap-2" key={`${q}-${stockFilter}`}>
        <label htmlFor="admin-q" className="sr-only">Rechercher un produit</label>
        <input
          id="admin-q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Nom, marque ou référence…"
          className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-sm sm:max-w-xs"
        />
        <label htmlFor="admin-stock" className="sr-only">Filtrer par stock</label>
        <select id="admin-stock" name="stock" defaultValue={stockFilter ?? ""} className="h-10 rounded-xl border border-line bg-card px-3 text-sm">
          <option value="">Tous les stocks</option>
          <option value="faible">Stock faible (1 à 5)</option>
          <option value="rupture">En rupture</option>
        </select>
        <button type="submit" className={buttonClasses({ variant: "outline", size: "sm", className: "h-10" })}>Filtrer</button>
      </Form>

      <p className="mb-3 text-sm text-muted">{products.length} produit{products.length > 1 ? "s" : ""}</p>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Produit</th>
              <th scope="col" className="px-4 py-3">Catégorie</th>
              <th scope="col" className="px-4 py-3 text-right">Prix</th>
              <th scope="col" className="px-4 py-3 text-right">Stock</th>
              <th scope="col" className="px-4 py-3">Accueil</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} data-testid="admin-product-row" className="hover:bg-surface/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductPhoto product={p} sizes="48px" rounded="xl" className="h-12 w-12 shrink-0" />
                    <div className="min-w-0">
                      <p className="max-w-[18rem] truncate font-semibold text-ink">{p.name}</p>
                      <p className="text-xs text-muted">{p.id} · {p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{getCategory(p.category).name}</td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                  {formatPrice(p.price)}
                  {p.oldPrice && <span className="block text-xs font-normal text-muted line-through">{formatPrice(p.oldPrice)}</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-bold",
                      p.stock === 0 ? "bg-danger-50 text-danger" : p.stock <= 5 ? "bg-accent-50 text-accent-700" : "bg-brand-50 text-brand-700",
                    )}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{p.featured ? "Oui" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/produits/${p.id}`}
                    className={buttonClasses({ variant: "ghost", size: "sm" })}
                    aria-label={`Modifier ${p.name}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">Aucun produit ne correspond.</p>}
      </div>
    </>
  );
}
