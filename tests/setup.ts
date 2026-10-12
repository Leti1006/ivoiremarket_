import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  // Les tests marqués « @vitest-environment jsdom » disposent d'un DOM simulé.
  if (typeof window === "undefined") return;
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
