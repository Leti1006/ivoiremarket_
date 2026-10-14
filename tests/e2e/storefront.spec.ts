import { expect, test, type Page } from "@playwright/test";

/**
 * Avec Cache Components, Next.js garde les pages précédentes montées mais
 * masquées (<Activity>) : on ne cible donc que les éléments visibles.
 */
const tid = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });

const fcfa = (text: string) => Number(text.replace(/\D/g, ""));

test.describe("navigation et catalogue", () => {
  test("l'accueil présente la boutique et ses catégories", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/IvoireMarket/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("La technologie");
    await expect(page.getByText(/Boutique de démonstration/)).toBeVisible();
    await expect(page.getByRole("link", { name: /Smartphones\s+5 produits/ })).toBeVisible();
  });

  test("la recherche de l'en-tête mène aux bons résultats", async ({ page, isMobile }) => {
    await page.goto("/");
    const search = page.locator(isMobile ? "#search-mobile" : "#search-desktop");
    await search.fill("casque");
    await search.press("Enter");
    await expect(page).toHaveURL(/\/catalogue\?q=casque/);
    const cards = tid(page, "product-card");
    await expect(cards.first()).toBeVisible();
    await expect(tid(page, "results-count")).toContainText("pour « casque »");
    for (const text of await cards.allInnerTexts()) expect(text.toLowerCase()).toContain("casque");
  });

  test("filtre par catégorie et trie par prix croissant", async ({ page }) => {
    await page.goto("/catalogue");
    await page.getByRole("navigation", { name: "Catégories" }).getByRole("link", { name: "Ordinateurs portables" }).click();
    await expect(page).toHaveURL(/categorie=ordinateurs/);
    await page.getByLabel("Trier par").selectOption("prix-asc");
    await expect(page).toHaveURL(/tri=prix-asc/);

    const cards = tid(page, "product-card");
    await expect(cards).toHaveCount(6);
    const prices = (await cards.locator("span.font-extrabold").allInnerTexts()).map(fcfa);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test("affiche un message utile quand rien ne correspond", async ({ page }) => {
    await page.goto("/catalogue?q=introuvable123");
    await expect(page.getByRole("heading", { name: /Aucun produit ne correspond/ })).toBeVisible();
    await page.getByRole("link", { name: "Voir tous les produits" }).click();
    await expect(page).toHaveURL(/\/catalogue$/);
    await expect(tid(page, "product-card").first()).toBeVisible();
  });

  test("une adresse inconnue affiche la page 404", async ({ page }) => {
    const response = await page.goto("/produits/produit-qui-n-existe-pas");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Cette page est introuvable" })).toBeVisible();
    await page.getByRole("link", { name: "Retour à l'accueil", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("le menu mobile s'ouvre et permet de naviguer", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Uniquement sur mobile");
    await page.goto("/");
    await page.getByRole("button", { name: "Ouvrir le menu" }).click();
    await page.getByRole("navigation", { name: "Navigation mobile" }).getByRole("link", { name: "Catalogue" }).click();
    await expect(page).toHaveURL(/\/catalogue$/);
    await expect(page.getByRole("navigation", { name: "Navigation mobile" })).toBeHidden();
  });
});

test.describe("panier et commande", () => {
  test("parcours complet : ajout, panier conservé, commande, confirmation", async ({ page }) => {
    // 1) Ajout de 2 casques JBL (39 000 FCFA l'unité).
    await page.goto("/produits/casque-jbl-synchros-e50bt");
    await page.getByRole("button", { name: "Augmenter la quantité" }).click();
    await page.getByRole("button", { name: /Ajouter au panier/ }).click();
    await expect(tid(page, "cart-count")).toHaveText("2");

    // 2) Ajout d'un routeur 4G (49 000 FCFA).
    await page.goto("/produits/routeur-4g-huawei-b528s");
    await page.getByRole("button", { name: /Ajouter au panier/ }).click();
    await expect(tid(page, "cart-count")).toHaveText("3");

    // 3) Le panier survit à une actualisation.
    await page.goto("/panier");
    await page.reload();
    await expect(tid(page, "cart-line")).toHaveCount(2);
    await expect(tid(page, "subtotal")).toHaveText(/127\s000\sFCFA/);

    // 4) Modification et suppression.
    await page.getByRole("group", { name: /Quantité pour Casque JBL/ }).getByRole("button", { name: "Diminuer la quantité" }).click();
    await expect(tid(page, "subtotal")).toHaveText(/88\s000\sFCFA/);
    await page.getByRole("button", { name: /Retirer Routeur 4G/ }).click();
    await expect(tid(page, "cart-line")).toHaveCount(1);
    await expect(tid(page, "subtotal")).toHaveText(/39\s000\sFCFA/);

    // 5) Commande : d'abord un envoi invalide.
    await page.getByRole("link", { name: "Passer la commande" }).click();
    await expect(page).toHaveURL(/\/commande$/);
    await page.getByRole("button", { name: /Valider la commande/ }).click();
    await expect(page.getByText("Indiquez votre nom complet (3 caractères minimum).")).toBeVisible();
    await expect(page.getByLabel("Nom complet")).toBeFocused();

    // 6) Puis un envoi valide.
    await page.getByLabel("Nom complet").fill("Aya Konan");
    await page.getByLabel("Téléphone").fill("07 08 09 10 11");
    await page.getByLabel("Zone de livraison").selectOption("abidjan-cocody");
    await expect(tid(page, "delivery-fee")).toHaveText(/2\s000\sFCFA/);
    await expect(tid(page, "total")).toHaveText(/41\s000\sFCFA/);
    await page.getByLabel("Adresse ou point de repère").fill("Riviera 2, près de la pharmacie");
    await page.getByRole("button", { name: /Valider la commande/ }).click();

    // 7) Confirmation.
    await expect(page).toHaveURL(/\/commande\/confirmation$/);
    await expect(page.getByRole("heading", { name: /Merci, commande validée/ })).toBeVisible();
    await expect(tid(page, "order-number")).toHaveText(/^IM-\d{8}-[0-9A-F]{6}$/);
    await expect(tid(page, "total")).toHaveText(/41\s000\sFCFA/);
    await expect(page.getByText("+225 07 08 09 10 11")).toBeVisible();
    await expect(tid(page, "cart-count")).toHaveCount(0);

    await page.getByRole("link", { name: "Retour au catalogue" }).click();
    await expect(page).toHaveURL(/\/catalogue$/);
  });

  test("le panier vide propose de découvrir le catalogue", async ({ page }) => {
    await page.goto("/panier");
    await expect(page.getByRole("heading", { name: "Votre panier est vide" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Découvrir le catalogue/ })).toBeVisible();
  });

  test("les photos réelles sont servies et créditées", async ({ page }) => {
    await page.goto("/produits/apple-iphone-15-128go");
    const img = page.getByRole("img", { name: "Apple iPhone 15 128 Go" }).first();
    await expect(img).toBeVisible();
    expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
    await expect(page.getByText(/via Wikimedia Commons/)).toBeVisible();
    await page.goto("/credits");
    await expect(page.getByRole("heading", { name: "Crédits photos" })).toBeVisible();
    await expect(page.getByText(/^Auteur :/)).toHaveCount(29);
  });

  test("les en-têtes de sécurité sont présents", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-powered-by"]).toBeUndefined();
  });
});
