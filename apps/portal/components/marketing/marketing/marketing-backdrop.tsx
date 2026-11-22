"use client";

/**
 * Decoración ambiental compartida por los encabezados públicos.
 * Sin imágenes pesadas, sin bloqueo de interacciones y sin significado informativo.
 * El movimiento se desactiva desde CSS con prefers-reduced-motion.
 */
export function MarketingBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="marketing-atmosphere pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <span className="marketing-atmosphere__orb marketing-atmosphere__orb--left" />
      <span className="marketing-atmosphere__orb marketing-atmosphere__orb--right" />
      <span className="marketing-atmosphere__ring marketing-atmosphere__ring--outer" />
      <span className="marketing-atmosphere__ring marketing-atmosphere__ring--inner" />
      <span className="marketing-atmosphere__dots" />
    </div>
  );
}
