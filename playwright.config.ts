import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de parcours utilisateur.
 * - Par défaut : lance le build de production local sur le port 3100, avec
 *   une base de données de test vierge et des identifiants admin de test.
 * - Avec BASE_URL : teste une instance déjà démarrée (conteneur Docker,
 *   serveur EC2…). Les tests d'administration ne s'exécutent alors que si
 *   E2E_ADMIN_PASSWORD est fourni.
 */
const externalUrl = process.env.BASE_URL;
const baseURL = externalUrl ?? "http://localhost:3100";

// Identifiants utilisés UNIQUEMENT par le serveur de test lancé ci-dessous.
const TEST_ADMIN = { username: "admin", password: "e2e-mot-de-passe-admin" };
if (!externalUrl) {
  process.env.E2E_ADMIN_USERNAME ??= TEST_ADMIN.username;
  process.env.E2E_ADMIN_PASSWORD ??= TEST_ADMIN.password;
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  // En local (portable Windows), un seul navigateur à la fois évite la
  // contention CPU qui faisait expirer des tests pourtant rapides (< 1 s).
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 1 : 0,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL,
    locale: "fr-FR",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: externalUrl
    ? undefined
    : {
        // Base de test supprimée à chaque lancement : résultats reproductibles.
        command:
          "node -e \"require('fs').rmSync('.e2e-data',{recursive:true,force:true})\" && npm run start -- -p 3100",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          DATABASE_PATH: ".e2e-data/ivoiremarket.db",
          ADMIN_USERNAME: TEST_ADMIN.username,
          ADMIN_PASSWORD: TEST_ADMIN.password,
          SESSION_SECRET: "e2e-secret-de-session-uniquement-pour-les-tests",
        },
      },
});
