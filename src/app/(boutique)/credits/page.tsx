import type { Metadata } from "next";
import Image from "next/image";
import { listProductImages } from "@/data/product-images";

export const metadata: Metadata = {
  title: "Crédits photos",
  description: "Auteurs et licences des photographies utilisées sur IvoireMarket.",
};

export default function CreditsPage() {
  const images = listProductImages();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Crédits photos</h1>
      <p className="mt-2 max-w-3xl text-muted">
        Les photographies de produits proviennent de{" "}
        <a href="https://commons.wikimedia.org" className="font-medium text-brand-700 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
          Wikimedia Commons
        </a>{" "}
        et sont publiées sous licences libres (CC0, CC BY, CC BY-SA). Elles ont été redimensionnées et
        converties au format WebP. Elles illustrent les modèles proposés et ne sont pas contractuelles.
        Les marques citées appartiennent à leurs propriétaires respectifs.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2">
        {images.map((img) => (
          <li key={img.key} className="flex gap-4 rounded-2xl border border-line bg-card p-3 shadow-card">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3f1ec]">
              <Image src={img.thumb} alt="" fill sizes="80px" className="object-contain p-1 mix-blend-multiply" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold text-ink" title={img.title}>{img.title}</p>
              <p className="text-muted">Auteur : {img.author}</p>
              <p className="text-muted">
                Licence :{" "}
                {img.licenseUrl ? (
                  <a href={img.licenseUrl} target="_blank" rel="noopener noreferrer license" className="text-brand-700 underline-offset-2 hover:underline">
                    {img.license}
                  </a>
                ) : (
                  img.license
                )}{" "}
                ·{" "}
                <a href={img.source} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline-offset-2 hover:underline">
                  Source
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
