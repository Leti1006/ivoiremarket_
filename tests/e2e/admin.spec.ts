import { expect, test, type Page } from "@playwright/test";

/** Ne cibler que les éléments visibles (les pages précédentes restent montées mais masquées). */
const tid = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });

const username = process.env.E2E_ADMIN_USERNAME ?? "admin";
const password = process.env.E2E_ADMIN_PASSWORD;

async function login(page: Page) {
  await page.goto("/admin/connexion");
  await page.getByLabel("Identifiant").fill(username);
  await page.getByLabel("Mot de passe").fill(password!);
  await page.getByRole("button", { name: "Se connecter" }).click();
  // Connexion = Server Action + redirection + rendu du tableau de bord.
  await expect(page).toHaveURL(/\/admin$/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Tableau de bord" })).toBeVisible({ timeout: 15_000 });
}

/** Suffixe unique composé uniquement de lettres (le nom client refuse les chiffres). */
function letters(): string {
  return Date.now().toString(36).replace(/[0-9]/g, (d) => "abcdefghij"[Number(d)]);
}

test.describe("espace administrateur", () => {
  test.skip(!password, "Identifiants d'administration de test non fournis");

  test("un visiteur non connecté est redirigé vers la connexion", async ({ page }) => {
    await page.goto("/admin/produits");
    await expect(page).toHaveURL(/\/admin\/connexion$/);
    await expect(page.getByRole("heading", { name: "Espace administrateur" })).toBeVisible();
  });

  test("un mauvais mot de passe est refusé", async ({ page }) => {
    await page.goto("/admin/connexion");
    await page.getByLabel("Identifiant").fill(username);
    await page.getByLabel("Mot de passe").fill("mauvais-mot-de-passe");
    await page.getByRole("button", { name: "Se connecter" }).click();
    // (Next.js ajoute aussi un annonceur de route invisible portant role="alert".)
    await expect(page.getByRole("alert").filter({ hasText: "Identifiant ou mot de passe incorrect." })).toBeVisible();
    await expect(page).toHaveURL(/\/admin\/connexion$/);
  });

  test("créer, modifier puis supprimer un produit visible dans la boutique", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Parcours d'administration testé sur ordinateur");
    const name = `Produit E2E ${Date.now()}`;
    await login(page);

    // Création
    await page.getByRole("link", { name: "Produits", exact: true }).click();
    await page.getByRole("link", { name: "Nouveau produit" }).click();
    await page.getByRole("button", { name: "Créer le produit" }).click();
    await expect(page.getByText("Nom : 3 caractères minimum.")).toBeVisible();

    await page.locator("#f-name").fill(name);
    await page.locator("#f-brand").fill("TestMarque");
    await page.locator("#f-category").selectOption("accessoires");
    await page.locator("#f-price").fill("12 345");
    await page.locator("#f-stock").fill("3");
    await page.locator("#f-description").fill("Produit créé automatiquement par les tests de bout en bout.");
    await page.locator("#f-highlights").fill("Premier point\nSecond point");
    await page.locator("#f-image").selectOption("logitech-k120");
    await page.getByRole("button", { name: "Créer le produit" }).click();
    await expect(page).toHaveURL(/\/admin\/produits\?ok=cree/);
    await expect(page.getByRole("status")).toHaveText("Produit créé.");

    // Visible dans la boutique
    await page.goto(`/catalogue?q=${encodeURIComponent(name)}`);
    await expect(tid(page, "product-card")).toHaveCount(1);
    await expect(tid(page, "product-card")).toContainText("12 345 FCFA");

    // Modification du prix
    await page.goto(`/admin/produits?q=${encodeURIComponent(name)}`);
    await page.getByRole("link", { name: `Modifier ${name}` }).click();
    await page.locator("#f-price").fill("9900");
    await page.getByRole("button", { name: "Enregistrer les modifications" }).click();
    await expect(page.getByRole("status")).toHaveText("Produit mis à jour.");
    await page.goto(`/catalogue?q=${encodeURIComponent(name)}`);
    await expect(tid(page, "product-card")).toContainText("9 900 FCFA");

    // Suppression (avec confirmation)
    await page.goto(`/admin/produits?q=${encodeURIComponent(name)}`);
    await page.getByRole("link", { name: `Modifier ${name}` }).click();
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Supprimer" }).click();
    await expect(page.getByRole("status")).toHaveText("Produit supprimé.");
    await page.goto(`/catalogue?q=${encodeURIComponent(name)}`);
    await expect(page.getByRole("heading", { name: /Aucun produit ne correspond/ })).toBeVisible();
  });

  test("une commande passée en boutique est traitée dans l'administration", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "Parcours d'administration testé sur ordinateur");
    const customer = `Client Test ${letters()}`;

    // Commande d'un câble (2 500 FCFA) depuis la boutique
    await page.goto("/produits/cable-usb-a-vers-usb-c");
    await page.getByRole("button", { name: /Ajouter au panier/ }).click();
    await page.goto("/commande");
    await page.getByLabel("Nom complet").fill(customer);
    await page.getByLabel("Téléphone").fill("0102030405");
    await page.getByLabel("Zone de livraison").selectOption("abidjan-plateau");
    await page.getByLabel("Adresse ou point de repère").fill("Plateau, avenue Chardy");
    await page.getByRole("button", { name: /Valider la commande/ }).click();
    await expect(page).toHaveURL(/\/commande\/confirmation$/, { timeout: 15_000 });
    const orderNumber = (await tid(page, "order-number").textContent())!.trim();

    // Traitement par l'administrateur
    await login(page);
    await page.getByRole("link", { name: "Commandes", exact: true }).click();
    await page.getByRole("link", { name: orderNumber }).click();
    await expect(page.getByText(customer)).toBeVisible();
    await expect(page.getByText("4 500 FCFA").first()).toBeVisible(); // 2 500 + 2 000 de livraison

    await page.getByRole("button", { name: "Marquer « Confirmée »" }).click();
    await expect(page.getByRole("button", { name: "Marquer « Expédiée »" })).toBeVisible();
    await page.getByRole("button", { name: "Marquer « Expédiée »" }).click();
    await expect(page.getByRole("button", { name: "Marquer « Livrée »" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Annuler la commande" })).toHaveCount(0);

    // Déconnexion
    await page.getByRole("button", { name: "Déconnexion" }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/\/admin\/connexion$/);
  });
});
