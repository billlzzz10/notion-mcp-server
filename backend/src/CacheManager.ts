import { promises as fs } from "node:fs";
import { join } from "node:path";
import crypto from "node:crypto";

export class CacheManager {
  constructor(private baseDir = "./cache", private maxEntries = 500) {}

  private keyToPath(key: string): string {
    const hash = crypto.createHash("sha1").update(key).digest("hex");
    return join(this.baseDir, `${hash}.json`);
  }

  async get(key: string): Promise<any | null> {
    try {
      const p = this.keyToPath(key);
      const data = await fs.readFile(p, "utf8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    await fs.mkdir(this.baseDir, { recursive: true });
    const p = this.keyToPath(key);
    await fs.writeFile(p, JSON.stringify({ value, ts: Date.now() }), "utf8");
    // simple GC by count
    await this.gc();
  }

  private async gc(): Promise<void> {
    try {
      const files = await fs.readdir(this.baseDir);
      if (files.length <= this.maxEntries) return;
      // remove oldest first
      const stats = await Promise.all(
        files.map(async f => {
          const st = await fs.stat(join(this.baseDir, f));
          return { f, t: st.mtimeMs };
        })
      );
      stats.sort((a, b) => a.t - b.t);
      const toDel = stats.slice(0, stats.length - this.maxEntries);
      await Promise.all(toDel.map(s => fs.unlink(join(this.baseDir, s.f))));
    } catch {
      // ignore GC errors
    }
  }
}
