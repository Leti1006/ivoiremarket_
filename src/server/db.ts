import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedProducts } from "@/data/seed-products";

/**
 * Base de données SQLite intégrée à Node.js (module node:sqlite) :
 * aucune dépendance native à compiler, un simple fichier à sauvegarder.
 *
 * Emplacement : $DATABASE_PATH, sinon ./data/ivoiremarket.db.
 * Dans Docker, /app/data est un volume : les données survivent aux mises à jour.
 */
export function resolveDatabasePath(): string {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "ivoiremarket.db");
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  brand       TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price > 0),
  old_price   INTEGER CHECK (old_price IS NULL OR old_price > price),
  stock       INTEGER NOT NULL CHECK (stock >= 0),
  description TEXT NOT NULL,
  highlights  TEXT NOT NULL DEFAULT '[]',
  featured    INTEGER NOT NULL DEFAULT 0,
  image       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  number       TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'nouvelle',
  full_name    TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  zone_id      TEXT NOT NULL,
  zone_label   TEXT NOT NULL,
  address      TEXT NOT NULL,
  note         TEXT,
  subtotal     INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  total        INTEGER NOT NULL,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

-- Les lignes copient le nom et le prix : une commande reste lisible
-- même si le produit est modifié ou supprimé ensuite.
CREATE TABLE IF NOT EXISTS order_items (
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name       TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity   INTEGER NOT NULL CHECK (quantity > 0),
  line_total INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_order ON order_items(order_id);
`;

export function openDatabase(file: string): DatabaseSync {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  db.exec(SCHEMA);
  seedIfEmpty(db);
  return db;
}

function seedIfEmpty(db: DatabaseSync): void {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (n > 0) return;
  const insert = db.prepare(
    `INSERT INTO products (id, slug, name, brand, category, price, old_price, stock, description, highlights, featured, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  transaction(db, () => {
    for (const p of seedProducts) {
      insert.run(
        p.id, p.slug, p.name, p.brand, p.category, p.price, p.oldPrice ?? null, p.stock,
        p.description, JSON.stringify(p.highlights), p.featured ? 1 : 0, p.image ?? null,
      );
    }
  });
}

/** Exécute fn dans une transaction : tout est appliqué, ou rien. */
export function transaction<T>(db: DatabaseSync, fn: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

// Une seule connexion par processus (conservée entre les rechargements en développement).
const globalForDb = globalThis as unknown as { __ivoireDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  globalForDb.__ivoireDb ??= openDatabase(resolveDatabasePath());
  return globalForDb.__ivoireDb;
}

/** Réservé aux tests : remplace la connexion courante. */
export function setDbForTests(db: DatabaseSync): void {
  globalForDb.__ivoireDb = db;
}
