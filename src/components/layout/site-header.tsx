import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CartLink } from "@/features/cart/components/cart-link";
import { MobileMenu } from "./mobile-menu";
import { NAV_LINKS } from "./nav-links";
import { SearchForm } from "./search-form";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <MobileMenu />
        <Logo className="shrink-0" />
        <SearchForm className="hidden flex-1 md:block md:max-w-xl" id="search-desktop" />
        <div className="ml-auto flex items-center">
          <CartLink />
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchForm id="search-mobile" />
      </div>

      <nav aria-label="Navigation principale" className="hidden border-t border-line/70 lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-block px-3 py-2.5 text-sm font-medium text-muted hover:text-brand-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
