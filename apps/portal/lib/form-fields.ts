type ValidationIssue = { path: readonly PropertyKey[]; message: string };

export function fieldErrorsFrom(issues: readonly ValidationIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const name = issue.path.map(String).join(".");
    if (name && !errors[name]) errors[name] = issue.message;
  }
  return errors;
}

const examples: Record<string, string> = {
  nombre: "Ej. María",
  apellido: "Ej. García",
  correo: "nombre@empresa.com",
  telefono: "Ej. 987 654 321",
  cargo: "Ej. Responsable de calidad",
  ruc: "Ej. 20123456789",
  razon_social: "Ej. Agroexportadora del Valle S.A.C.",
  nombre_razon_social: "Ej. Productor del Valle S.A.C.",
  nombre_comercial: "Ej. Agro del Valle",
  tipo_empresa: "Ej. Exportadora",
  codigo_lote: "Ej. AG-2026-001",
  peso_kg: "Ej. 1250.50",
  fundo: "Ej. Fundo La Esperanza",
  ubicacion: "Dirección o referencia del fundo",
  direccion: "Av., calle, número y referencia",
};
export function fieldPlaceholder(name: string, label: string): string {
  return examples[name] ?? "Ingresa " + label.toLocaleLowerCase("es");
}
