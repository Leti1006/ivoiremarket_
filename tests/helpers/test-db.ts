import { openDatabase, setDbForTests } from "@/server/db";

/** Base SQLite en mémoire, recréée (et réensemencée) pour chaque test. */
export function resetTestDatabase(): void {
  setDbForTests(openDatabase(":memory:"));
}
