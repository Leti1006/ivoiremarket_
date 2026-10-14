import { beforeEach, describe, expect, it } from "vitest";
import { seedProducts } from "@/data/seed-products";
import { productFormSchema, slugify } from "@/features/admin/product-schema";
import { createSessionToken, verifyCredentials, verifySessionToken, isRateLimited, recordFailure, clearFailures } from "@/server/auth";
import { changeOrderStatus, getDashboardStats, insertOrder } from "@/server/orders-repo";
import { createProduct, deleteProduct, findProductById, listProducts, slugExists, updateProduct } from "@/server/products-repo";
import { resetTestDatabase } from "../helpers/test-db";

beforeEach(() => resetTestDatabase());

function withoutId<T extends { id: string }>(value: T): Omit<T, "id"> {
  const copy: Partial<T> = { ...value };
  delete copy.id;
  return copy as Omit<T, "id">;
}

describe("base de données : produits", () => {
  it("est initialisée avec le catalogue de départ", () => {
    expect(listProducts()).toHaveLength(seedProducts.length);
    expect(findProductById("p-001")).toEqual(seedProducts[0]);
  });

  it("crée, modifie et supprime un produit", () => {
    const base = withoutId(seedProducts[0]);
    const created = createProduct({ ...base, slug: "nouveau-produit-test", name: "Produit test" });
    expect(created.id).toBe(`p-${String(seedProducts.length + 1).padStart(3, "0")}`);
    expect(slugExists("nouveau-produit-test")).toBe(true);
    expect(slugExists("nouveau-produit-test", created.id)).toBe(false);

    const updated = updateProduct(created.id, { ...base, slug: created.slug, name: "Produit renommé", stock: 0 });
    expect(updated).toMatchObject({ name: "Produit renommé", stock: 0 });

    expect(deleteProduct(created.id)).toBe(true);
    expect(findProductById(created.id)).toBeUndefined();
  });
});

function order(productId: string, quantity: number) {
  const p = findProductById(productId)!;
  return {
    orderNumber: `IM-TEST-${productId}-${quantity}`,
    createdAt: new Date().toISOString(),
    zoneId: "interieur",
    customer: { fullName: "Test Client", phone: "+225 07 00 00 00 00", zoneLabel: "Intérieur", address: "Bouaké centre" },
    lines: [{ productId, name: p.name, unitPrice: p.price, quantity, lineTotal: p.price * quantity }],
    subtotal: p.price * quantity,
    deliveryFee: 0,
    total: p.price * quantity,
  };
}

describe("base de données : commandes", () => {
  it("suit le cycle de vie et remet le stock en cas d'annulation", () => {
    const stored = insertOrder(order("p-012", 2)); // JBL, stock 14
    expect(findProductById("p-012")?.stock).toBe(12);

    expect(changeOrderStatus(stored.id, "livree")).toMatchObject({ ok: false }); // saut d'étape interdit
    expect(changeOrderStatus(stored.id, "confirmee")).toMatchObject({ ok: true });
    expect(changeOrderStatus(stored.id, "annulee")).toMatchObject({ ok: true });
    expect(findProductById("p-012")?.stock).toBe(14);
    expect(changeOrderStatus(stored.id, "confirmee")).toMatchObject({ ok: false }); // statut final
  });

  it("calcule les indicateurs du tableau de bord", () => {
    insertOrder(order("p-016", 1));
    const cancelled = insertOrder(order("p-017", 1));
    changeOrderStatus(cancelled.id, "annulee");
    const stats = getDashboardStats();
    expect(stats.ordersByStatus.nouvelle).toBe(1);
    expect(stats.ordersByStatus.annulee).toBe(1);
    expect(stats.revenue).toBe(9_500); // les commandes annulées ne comptent pas
    expect(stats.outOfStock).toBe(seedProducts.filter((p) => p.stock === 0).length);
  });
});

describe("formulaire produit de l'administration", () => {
  const valid = {
    name: "Écouteurs Test Pro", slug: "", brand: "Test", category: "ecouteurs", price: "25 000", oldPrice: "",
    stock: "4", description: "Une description suffisamment longue.", highlights: "Bluetooth\n\n  Autonomie 20 h  ",
    featured: true, image: "",
  };

  it("normalise les données et génère l'adresse", () => {
    const r = productFormSchema.parse(valid);
    expect(r).toMatchObject({ slug: "ecouteurs-test-pro", price: 25_000, stock: 4, highlights: ["Bluetooth", "Autonomie 20 h"] });
    expect(r.oldPrice).toBeUndefined();
    expect(r.image).toBeUndefined();
  });

  it("refuse un ancien prix inférieur, une photo inconnue ou une adresse invalide", () => {
    const r = productFormSchema.safeParse({ ...valid, oldPrice: "20000", image: "../../etc/passwd", slug: "Mauvaise Adresse" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(new Set(r.error.issues.map((i) => i.path[0]))).toEqual(new Set(["oldPrice", "image", "slug"]));
    }
  });

  it("slugify retire les accents et la ponctuation", () => {
    expect(slugify("  Écran Samsung 24\" (reconditionné) ! ")).toBe("ecran-samsung-24-reconditionne");
  });
});

describe("authentification administrateur", () => {
  const config = { username: "admin", password: "mot-de-passe-test", secret: "x".repeat(40) };

  it("vérifie les identifiants", () => {
    expect(verifyCredentials(config, "admin", "mot-de-passe-test")).toBe(true);
    expect(verifyCredentials(config, "admin", "mauvais")).toBe(false);
    expect(verifyCredentials(config, "root", "mot-de-passe-test")).toBe(false);
  });

  it("signe les sessions et rejette les jetons falsifiés ou expirés", () => {
    const now = Date.now();
    const token = createSessionToken(config.secret, now);
    expect(verifySessionToken(config.secret, token, now)).toBe(true);
    expect(verifySessionToken("y".repeat(40), token, now)).toBe(false);

    const [exp, nonce, sig] = token.split(".");
    expect(verifySessionToken(config.secret, `${Number(exp) + 99999}.${nonce}.${sig}`, now)).toBe(false);
    expect(verifySessionToken(config.secret, token, now + 9 * 3600 * 1000)).toBe(false);
    expect(verifySessionToken(config.secret, undefined, now)).toBe(false);
  });

  it("bloque après 5 échecs consécutifs", () => {
    const key = "test-ip";
    clearFailures(key);
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(true);
    expect(isRateLimited(key, Date.now() + 16 * 60 * 1000)).toBe(false);
  });
});
