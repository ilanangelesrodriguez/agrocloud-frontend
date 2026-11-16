// Estilo compartido de todos los campos del formulario (input, select, textarea, tarjeta del checkbox).
// Un borde verde visible y un fondo distinto al de la tarjeta hacen que se distingan en claro y oscuro.
export const fieldSurface =
  "border border-brand-600/25 bg-background shadow-none transition-colors hover:border-brand-600/50 focus-within:border-brand-600";

// Mismo campo, pero con borde rojo cuando hay error (reemplaza al verde, no se suma).
export const fieldSurfaceInvalid =
  "border border-danger bg-background shadow-none transition-colors focus-within:border-danger";