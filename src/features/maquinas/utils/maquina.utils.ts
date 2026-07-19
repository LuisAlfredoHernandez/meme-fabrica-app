import { Maquina, TipoMaquina } from "@/types";

/**
 * Mapeo por defecto de tipo de máquina a prefijo de código.
 */
const DEFAULT_PREFIXES: Record<string, string> = {
  plana: "REC",
  merrow: "MRW",
  cover: "CVR",
  corte: "CRT",
  plancha_dtf: "DTF",
  otro: "MAC",
};

/**
 * Genera el siguiente código secuencial para una máquina según su tipo.
 * Ejemplo: si existen máquinas del tipo 'plana' con código 'REC-01', la siguiente será 'REC-02'.
 */
export function generateNextCodigo(tipo: TipoMaquina | string, maquinas: Maquina[]): string {
  if (!tipo) return "";

  const existingForTipo = maquinas.filter((m) => m.tipo === tipo);

  let prefix = DEFAULT_PREFIXES[tipo] || tipo.substring(0, 3).toUpperCase();
  let maxNum = 0;
  let minDigits = 2; // Formato con 2 dígitos mínimos ("01", "02", "03"...)
  let separator = "-";

  if (existingForTipo.length > 0) {
    for (const m of existingForTipo) {
      if (!m.codigo) continue;
      // Captura prefijo, separador opcional y número secuencial final
      const match = m.codigo.match(/^(.*?)([-_]?)(0*\d+)$/);
      if (match) {
        const [, rawPrefix, sep, numStr] = match;
        if (rawPrefix) {
          prefix = rawPrefix;
        }
        if (sep) {
          separator = sep;
        }
        const num = parseInt(numStr, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
        if (numStr.length > minDigits) {
          minDigits = numStr.length;
        }
      }
    }
  }

  const nextNum = Math.max(existingForTipo.length, maxNum) + 1;
  const paddedNum = String(nextNum).padStart(minDigits, "0");

  return `${prefix}${separator}${paddedNum}`;
}
