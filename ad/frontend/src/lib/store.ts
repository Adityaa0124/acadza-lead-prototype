import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { State } from "./types";
import { seed } from "./domain";

const globals = globalThis as unknown as { acadzaDb?: DatabaseSync };

function getDbDir() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return join(tmpdir(), ".demo");
  }
  return join(process.cwd(), ".demo");
}

function db() {
  if (!globals.acadzaDb) {
    const dir = getDbDir();
    mkdirSync(dir, { recursive: true });
    globals.acadzaDb = new DatabaseSync(join(dir, "admissions.sqlite"));
    globals.acadzaDb.exec(
      "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, data TEXT NOT NULL)",
    );
    if (!globals.acadzaDb.prepare("SELECT id FROM state WHERE id=1").get())
      globals.acadzaDb
        .prepare("INSERT INTO state (id,data) VALUES (1,?)")
        .run(JSON.stringify(seed()));
  }
  return globals.acadzaDb;
}
export function read(): State {
  return JSON.parse(
    (
      db().prepare("SELECT data FROM state WHERE id=1").get() as {
        data: string;
      }
    ).data,
  );
}
export function transaction<T>(fn: (state: State) => T): T {
  const connection = db();
  connection.exec("BEGIN IMMEDIATE");
  try {
    const state = read();
    const result = fn(state);
    connection
      .prepare("UPDATE state SET data=? WHERE id=1")
      .run(JSON.stringify(state));
    connection.exec("COMMIT");
    return result;
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}
