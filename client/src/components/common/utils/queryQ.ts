import qs from "qs";

type UnknownRecord = Record<string, unknown>;

function isEmptyScalar(value: unknown) {
  return value === undefined || value === null || value === "";
}

function isEmptyValue(value: unknown) {
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmptyScalar);
  return isEmptyScalar(value);
}

function pruneEmptyValues(input: UnknownRecord): UnknownRecord {
  const output: UnknownRecord = {};
  Object.entries(input).forEach(([key, value]) => {
    if (isEmptyValue(value)) return;
    if (value instanceof Date) {
      output[key] = value.toISOString();
      return;
    }
    if (Array.isArray(value)) {
      const mapped = value.map(item => (item instanceof Date ? item.toISOString() : item));
      const filtered = mapped.filter(item => !isEmptyScalar(item));
      if (filtered.length === 0) return;
      output[key] = filtered;
      return;
    }
    output[key] = value;
  });
  return output;
}

export class QueryQUtils {
  static parseQ(q: unknown): UnknownRecord {
    const raw =
      typeof q === "string" ? q : Array.isArray(q) ? (q[0] ?? "") : "";
    if (!raw) return {};
    const parsed = qs.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as UnknownRecord;
  }

  static encodeQ(obj: UnknownRecord): string | null {
    const pruned = pruneEmptyValues(obj);
    if (Object.keys(pruned).length === 0) return null;
    const encoded = qs.stringify(pruned, {
      encodeValuesOnly: true,
      arrayFormat: "brackets",
      skipNulls: true,
    });
    return encoded || null;
  }

  static getQFromUrl(url: string): string | null {
    try {
      const u = new URL(
        url,
        typeof window !== "undefined" ? window.location.origin : "http://localhost",
      );
      const q = u.searchParams.get("q");
      return q && q.length > 0 ? q : null;
    } catch {
      return null;
    }
  }

  static parseQFromUrl(url: string): UnknownRecord {
    const q = QueryQUtils.getQFromUrl(url);
    return QueryQUtils.parseQ(q);
  }
}
