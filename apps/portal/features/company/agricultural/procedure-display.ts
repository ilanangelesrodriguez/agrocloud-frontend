import type { Procedure } from "./schema";
export function versionLabel(value: string | number) {
  return (
    "v" +
    String(value)
      .trim()
      .replace(/^(?:v\s*)+(?=\d)/i, "")
  );
}
export function procedureKey(item: Procedure) {
  return JSON.stringify([
    item.nombre.trim().toLocaleLowerCase("es"),
    item.producto_id ?? item.producto ?? null,
  ]);
}
export function compareVersions(a: Procedure, b: Procedure) {
  return (
    String(b.version)
      .trim()
      .replace(/^(?:v\s*)+(?=\d)/i, "")
      .localeCompare(
        String(a.version)
          .trim()
          .replace(/^(?:v\s*)+(?=\d)/i, ""),
        "es",
        { numeric: true },
      ) || b.id - a.id
  );
}
