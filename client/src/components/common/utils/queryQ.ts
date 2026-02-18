import qs from "qs";

type UnknownRecord = Record<string, unknown>;

export function decode(q: unknown): UnknownRecord {
  const raw = typeof q === "string" ? q : Array.isArray(q) ? (q[0] ?? "") : "";
  if (!raw) return {};
  const parsed = qs.parse(raw);
  if (!parsed || typeof parsed !== "object") return {};
  return parsed as UnknownRecord;
}

export function encode(obj: UnknownRecord): string | null {
  const encoded = qs.stringify(obj, {
    encodeValuesOnly: true,
    arrayFormat: "indices",
    skipNulls: true,
    filter: (_prefix, value) => {
      if (value instanceof Date) return value.toISOString();
      if (value === undefined || value === null || value === "") return undefined;
      if (Array.isArray(value)) {
        const cleaned = value
          .map((item) => (item instanceof Date ? item.toISOString() : item))
          .filter((item) => item !== undefined && item !== null && item !== "");
        return cleaned.length > 0 ? cleaned : undefined;
      }
      return value;
    },
  });
  return encoded || null;
}
