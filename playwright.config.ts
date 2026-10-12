import { defineConfig, devices } from "@playwright/test";

/**
 * Tests de parcours utilisateur.
 * - Par défaut : lance le build de production local sur le port 3100.
 * - Avec BASE_URL : teste une instance déjà démarrée (conteneur Docker,
 *   serveur EC2…), par exemple BASE_URL=http://localhost:8080.
 */
const externalUrl = process.env.BASE_URL;
const baseURL = externalUrl ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
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
        command: "npm run start -- -p 3100",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
