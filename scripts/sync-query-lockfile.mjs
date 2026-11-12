import { readFileSync, writeFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const lockPath = "package-lock.json";
const webPath = "apps/web/package.json";
const portalPath = "apps/portal/package.json";

const web = readJson(webPath);
const portal = readJson(portalPath);
const lock = readJson(lockPath);
const pkg = "@tanstack/react-query";
const spec = portal.dependencies?.[pkg];

if (!spec || !lock.packages?.[`node_modules/${pkg}`]) {
  throw new Error("TanStack Query no está presente en el lockfile del portal. Ejecuta npm install desde la raíz.");
}
if (web.dependencies?.[pkg] !== spec) {
  throw new Error(`Dependencia web desalineada: ${web.dependencies?.[pkg]} != ${spec}`);
}
if (!lock.packages["apps/web"]?.dependencies) {
  throw new Error("El workspace apps/web no se encuentra en package-lock.json.");
}
lock.packages["apps/web"].dependencies[pkg] = spec;
writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
console.log(`Lockfile actualizado para @agrocloud/web: ${pkg}@${spec}`);
