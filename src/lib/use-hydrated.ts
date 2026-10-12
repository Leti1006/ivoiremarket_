"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Faux pendant le rendu serveur et la première hydratation, vrai ensuite.
 * Permet d'afficher un état de chargement au lieu d'un faux « panier vide ».
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
