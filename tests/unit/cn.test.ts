import { describe, expect, it } from "vitest";
import { cn } from "@/lib/cn";

describe("cn", () => {
  it("assemble les classes avec un espace", () => {
    expect(cn("btn", "btn-primary")).toBe("btn btn-primary");
  });

  it("ignore les valeurs vides", () => {
    expect(cn("btn", false, null, undefined, "", "actif")).toBe("btn actif");
  });

  it("renvoie une chaîne vide sans classe", () => {
    expect(cn()).toBe("");
    expect(cn(false, undefined)).toBe("");
  });
});
