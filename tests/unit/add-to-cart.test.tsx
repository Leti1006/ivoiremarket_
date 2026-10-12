// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AddToCart } from "@/features/cart/components/add-to-cart";
import { CartLink } from "@/features/cart/components/cart-link";
import { getProductBySlug } from "@/features/products/queries";

function product(slug: string) {
  const p = getProductBySlug(slug);
  if (!p) throw new Error(slug);
  return p;
}

describe("<AddToCart />", () => {
  it("ajoute la quantité choisie et met à jour le compteur du panier", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CartLink />
        <AddToCart product={product("jbl-tune-520bt")} />
      </>,
    );

    expect(screen.getByRole("link", { name: "Panier vide" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Augmenter la quantité" }));
    await user.click(screen.getByRole("button", { name: /ajouter au panier/i }));

    expect(screen.getByRole("link", { name: "Panier, 2 articles" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ajouté au panier/i })).toBeInTheDocument();
    expect(screen.getByText(/2 déjà dans votre panier/)).toBeInTheDocument();
  });

  it("limite la quantité au stock disponible", async () => {
    const user = userEvent.setup();
    // Apple MacBook Air M3 : 2 en stock.
    render(<AddToCart product={product("apple-macbook-air-m3")} />);
    const plus = screen.getByRole("button", { name: "Augmenter la quantité" });
    await user.click(plus);
    expect(plus).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /ajouter au panier/i }));
    expect(screen.getByText(/quantité maximale/)).toBeInTheDocument();
  });

  it("affiche un message pour un produit en rupture", () => {
    render(<AddToCart product={product("xiaomi-redmi-note-13")} />);
    expect(screen.getByText(/en rupture de stock/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /ajouter au panier/i })).not.toBeInTheDocument();
  });
});
