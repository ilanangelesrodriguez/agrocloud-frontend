/**
 * Limpieza conservadora de archivos de muestra de AgroCloud Portal.
 * Por defecto SOLO muestra el plan; para ejecutar, pasar --apply.
 * Compara el hash del blob Git original de main (2026-11-13) antes de borrar.
 */
import { createHash } from "node:crypto";
import { readFile, rm, rmdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const portal = join(root, "apps", "portal");
const options = process.argv.slice(2);

if (options.some((option) => option !== "--apply")) {
  console.error("Uso: node scripts/phase1-cleanup.mjs [--apply]");
  process.exit(2);
}

const apply = options.includes("--apply");

// Únicamente archivos de la plantilla inicial, NO los módulos del producto.
// sha = identificador de blob de Git, no hash SHA del archivo sin cabecera.
const templates = new Map([
  ["app/about/layout.tsx", "98956a52add2b43a15a9458f6e023577f137e88f"],
  ["app/about/page.tsx", "c79c1e64427010ccac4fe345fc10b6f8a4b2b6b9"],
  ["app/blog/layout.tsx", "911d0bcf4186303898cd264376bdf7ba3b01eb57"],
  ["app/blog/page.tsx", "c6d0c65b4362ebf8fc81c4b30411631625fa0cb5"],
  ["app/docs/layout.tsx", "eaf63f3b995acf0299a0239bd6d464cdfd593291"],
  ["app/docs/page.tsx", "4a2f19b3573dc06804d0ff77d7c78df7c10589db"],
  ["app/pricing/layout.tsx", "dc3db6af640f8a9e128b556f04f7574b733b741b"],
  ["app/pricing/page.tsx", "42e233392df39ba888f694e520f0e025f402a0ae"],
  ["components/navbar.tsx", "74f79b46a6f132d67c6ae2ff3b30c13bfd3b3f99"],
  ["components/counter.tsx", "4c48dd075f6e5af67ef37de946d4e1c6e1eab34f"],
  ["components/primitives.ts", "efe74ecd993a5257775c0633dac654eb98be7fb0"],
  ["config/site.ts", "1d3ab1b282e234dc480a81ba7dd485068b46013d"],
]);

const originalPackage = JSON.parse(await readFile(join(portal, "package.json"), "utf8"));
if (originalPackage.name !== "@agrocloud/portal") {
  console.error("La ruta actual no corresponde al workspace @agrocloud/portal.");
  process.exit(2);
}

function gitBlobHash(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`);
  return createHash("sha1").update(header).update(bytes).digest("hex");
}

const statuses = [];
for (const [relative, expected] of templates) {
  const absolute = join(portal, relative);
  let bytes;
  try {
    bytes = await readFile(absolute);
  } catch (error) {
    if (error?.code === "ENOENT") {
      statuses.push({ relative, state: "already-missing" });
      continue;
    }
    throw error;
  }
  statuses.push({
    relative,
    state: gitBlobHash(bytes) === expected ? "exact-template" : "changed",
  });
}

// Nunca borramos archivos que hayan sido personalizados por el equipo.
const changed = statuses.filter((entry) => entry.state === "changed");
for (const entry of statuses) {
  const description = entry.state === "exact-template"
    ? (apply ? "ELIMINAR" : "CANDIDATO")
    : entry.state === "changed"
      ? "CONSERVAR (modificado)"
      : "YA NO EXISTE";
  console.log(`${description.padEnd(22)} apps/portal/${entry.relative}`);
}

if (changed.length > 0) {
  console.error("\nSe detectaron cambios frente a la plantilla original; revisa esos archivos manualmente.");
  console.error("Por seguridad NO se realizará una eliminación parcial.");
  if (apply) process.exitCode = 1;
} else if (apply) {
  for (const entry of statuses.filter((item) => item.state === "exact-template")) {
    await rm(join(portal, entry.relative));
  }

  // Solo se eliminan las carpetas si realmente quedaron vacías.
  for (const folder of ["about", "blog", "docs", "pricing"]) {
    try {
      await rmdir(join(portal, "app", folder));
    } catch (error) {
      if (error?.code !== "ENOENT" && error?.code !== "ENOTEMPTY") throw error;
    }
  }
  console.log("\nLimpieza finalizada. Ahora ejecuta npm run format:portal.");
} else {
  console.log("\nSimulación: no se ha borrado nada. Para ejecutar: npm run cleanup:portal:apply");
}
