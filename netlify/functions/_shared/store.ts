import { getStore } from "@netlify/blobs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");

function filePath(storeName: string, key: string) {
  return path.join(DATA_DIR, `${storeName}-${key}.json`);
}

export async function readJson<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const store = getStore({ name: storeName, consistency: "strong" });
    const value = await store.get(key, { type: "json" });
    return (value as T) ?? null;
  } catch {
    try {
      const raw = await readFile(filePath(storeName, key), "utf8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}

export async function writeJson(storeName: string, key: string, value: unknown) {
  try {
    const store = getStore({ name: storeName, consistency: "strong" });
    await store.setJSON(key, value);
    return;
  } catch {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(filePath(storeName, key), JSON.stringify(value), "utf8");
  }
}
