import type { AiResult } from "@/game/types";

/**
 * Sustituto de `@/lib/ai/experiment` en la compilación estática.
 *
 * El original es una función de servidor de TanStack Start y no existe en un
 * sitio estático. `LabApp` ya envuelve la llamada en un try/catch y recurre al
 * intérprete local de órdenes en español (`parse-command.ts`), así que basta con
 * rechazar para que el panel de experimentos siga funcionando sin servidor.
 */
export async function runExperiment(): Promise<AiResult> {
  throw new Error("Sin servidor: se usa el intérprete local de órdenes.");
}
