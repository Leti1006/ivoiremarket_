import type { DemoOrder, OrderLine } from "@/features/checkout/order";
import { getDb, transaction } from "./db";

import { STATUS_LABELS, STATUS_TRANSITIONS, ORDER_STATUSES, type OrderStatus } from "@/features/admin/order-status";

export { ORDER_STATUSES, STATUS_LABELS, STATUS_TRANSITIONS, type OrderStatus };

export type StoredOrder = DemoOrder & {
  id: number;
  status: OrderStatus;
  zoneId: string;
  updatedAt: string;
};

export class OutOfStockError extends Error {
  constructor(public productName: string) {
    super(`Stock insuffisant pour « ${productName} ».`);
  }
}

type NewOrder = Omit<DemoOrder, "createdAt"> & { zoneId: string; createdAt: string };

/**
 * Enregistre la commande et décrémente le stock dans UNE transaction.
 * La mise à jour « stock = stock - q WHERE stock >= q » est atomique :
 * deux clients ne peuvent pas acheter le dernier exemplaire en même temps.
 */
export function insertOrder(order: NewOrder): StoredOrder {
  const db = getDb();
  return transaction(db, () => {
    const decrement = db.prepare("UPDATE products SET stock = stock - ?, updated_at = datetime('now') WHERE id = ? AND stock >= ?");
    for (const line of order.lines) {
      if (decrement.run(line.quantity, line.productId, line.quantity).changes === 0) {
        throw new OutOfStockError(line.name);
      }
    }
    const { lastInsertRowid } = db
      .prepare(
        `INSERT INTO orders (number, status, full_name, phone, email, zone_id, zone_label, address, note,
           subtotal, delivery_fee, total, created_at, updated_at)
         VALUES (?, 'nouvelle', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        order.orderNumber, order.customer.fullName, order.customer.phone, order.customer.email ?? null,
        order.zoneId, order.customer.zoneLabel, order.customer.address, order.customer.note ?? null,
        order.subtotal, order.deliveryFee, order.total, order.createdAt, order.createdAt,
      );
    const insertItem = db.prepare(
      "INSERT INTO order_items (order_id, product_id, name, unit_price, quantity, line_total) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const l of order.lines) insertItem.run(lastInsertRowid, l.productId, l.name, l.unitPrice, l.quantity, l.lineTotal);
    return findOrderById(Number(lastInsertRowid))!;
  });
}

type OrderRow = {
  id: number;
  number: string;
  status: OrderStatus;
  full_name: string;
  phone: string;
  email: string | null;
  zone_id: string;
  zone_label: string;
  address: string;
  note: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
};

type ItemRow = { product_id: string; name: string; unit_price: number; quantity: number; line_total: number };

function toOrder(row: OrderRow, items: ItemRow[]): StoredOrder {
  const lines: OrderLine[] = items.map((i) => ({
    productId: i.product_id,
    name: i.name,
    unitPrice: i.unit_price,
    quantity: i.quantity,
    lineTotal: i.line_total,
  }));
  return {
    id: row.id,
    orderNumber: row.number,
    status: row.status,
    zoneId: row.zone_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    customer: {
      fullName: row.full_name,
      phone: row.phone,
      email: row.email ?? undefined,
      zoneLabel: row.zone_label,
      address: row.address,
      note: row.note ?? undefined,
    },
    lines,
    subtotal: row.subtotal,
    deliveryFee: row.delivery_fee,
    total: row.total,
  };
}

const ITEMS_SQL = "SELECT product_id, name, unit_price, quantity, line_total FROM order_items WHERE order_id = ?";

export function findOrderById(id: number): StoredOrder | undefined {
  const db = getDb();
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
  return row ? toOrder(row, db.prepare(ITEMS_SQL).all(id) as ItemRow[]) : undefined;
}

export function listOrders(options: { status?: OrderStatus; limit?: number } = {}): StoredOrder[] {
  const db = getDb();
  const rows = (
    options.status
      ? db.prepare("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC, id DESC LIMIT ?").all(options.status, options.limit ?? 500)
      : db.prepare("SELECT * FROM orders ORDER BY created_at DESC, id DESC LIMIT ?").all(options.limit ?? 500)
  ) as OrderRow[];
  const items = db.prepare(ITEMS_SQL);
  return rows.map((r) => toOrder(r, items.all(r.id) as ItemRow[]));
}

export type StatusChangeResult = { ok: true; order: StoredOrder } | { ok: false; error: string };

/** Change le statut ; une annulation remet les articles en stock. */
export function changeOrderStatus(id: number, next: OrderStatus): StatusChangeResult {
  const db = getDb();
  return transaction(db, () => {
    const current = findOrderById(id);
    if (!current) return { ok: false, error: "Commande introuvable." };
    if (!STATUS_TRANSITIONS[current.status].includes(next)) {
      return {
        ok: false,
        error: `Impossible de passer de « ${STATUS_LABELS[current.status]} » à « ${STATUS_LABELS[next]} ».`,
      };
    }
    if (next === "annulee") {
      const restock = db.prepare("UPDATE products SET stock = stock + ?, updated_at = datetime('now') WHERE id = ?");
      for (const line of current.lines) restock.run(line.quantity, line.productId);
    }
    db.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(next, new Date().toISOString(), id);
    return { ok: true, order: findOrderById(id)! };
  });
}

export type DashboardStats = {
  productCount: number;
  outOfStock: number;
  lowStock: number;
  ordersByStatus: Record<OrderStatus, number>;
  /** Chiffre d'affaires des commandes non annulées (démonstration). */
  revenue: number;
};

export function getDashboardStats(): DashboardStats {
  const db = getDb();
  const p = db
    .prepare(
      "SELECT COUNT(*) AS total, SUM(stock = 0) AS out, SUM(stock > 0 AND stock <= 5) AS low FROM products",
    )
    .get() as { total: number; out: number | null; low: number | null };
  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const r of db.prepare("SELECT status, COUNT(*) AS n FROM orders GROUP BY status").all() as { status: OrderStatus; n: number }[]) {
    byStatus[r.status] = r.n;
  }
  const { revenue } = db.prepare("SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'annulee'").get() as { revenue: number };
  return { productCount: p.total, outOfStock: p.out ?? 0, lowStock: p.low ?? 0, ordersByStatus: byStatus, revenue };
}
