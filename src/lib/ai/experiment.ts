import { createServerFn } from "@tanstack/react-start";
import { parseCommand } from "./parse-command";
import type { AiAction, AiResult } from "@/game/types";

const SYSTEM = `Eres el operador de DESTRUCT LAB, un simulador de destrucción estructural.
El usuario escribe en español. Responde SOLO un JSON válido, sin markdown, con esta forma:
{"message":"frase breve en español confirmando lo que vas a hacer","actions":[...]}
Acciones permitidas (omite campos innecesarios):
- {"type":"explosion","power":0.25-500,"radius":3-90,"height":0-30,"x":-40-40,"z":-40-40}  // power = kg equivalentes de TNT: 0,5 muy debil / 3 debil / 20 media / 120 fuerte / 500 extrema. Si omites radius se calcula solo.
- {"type":"earthquake","intensity":0-1}
- {"type":"meteor","x":-40-40,"z":-40-40,"power":5-300}
- {"type":"wind","strength":0-1}
- {"type":"collapse","target":"east-center"|"east-blue"|"bridge"|"west-b"|"all"}
- {"type":"shockwave","power":1-300,"x":number,"z":number}
- {"type":"spawn","catalog":"torre"|"edificio-medio"|"edificio-bajo"|"puente-mod"|"coche"|"camion"|"contenedor"|"columna"|"muro","x":number,"z":number}
- {"type":"timescale","value":0.25|0.5|1|2|5|10}
- {"type":"reset"}
- {"type":"camera","mode":"orbit"|"free"|"cinematic"|"follow"|"fps"}
Mapa: río en x=0, puente en (0,0), torre central en (22,2), edificio azul en (22,-16), bloques oeste en x=-22.
Si pide un puente de N metros, coloca varios puente-mod a lo largo de X.
message SIEMPRE en español natural, breve.`;

function sanitize(actions: unknown): AiAction[] {
  if (!Array.isArray(actions)) return [];
  const out: AiAction[] = [];
  for (const raw of actions) {
    if (!raw || typeof raw !== "object") continue;
    const a = raw as AiAction;
    if (typeof a.type !== "string") continue;
    out.push(a);
    if (out.length >= 8) break;
  }
  return out;
}

export const runExperiment = createServerFn({ method: "POST" })
  .validator((input: { prompt: string }) => ({
    prompt: String(input?.prompt ?? "").slice(0, 500),
  }))
  .handler(async ({ data }): Promise<AiResult> => {
    const local = parseCommand(data.prompt);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return local.ok
        ? local
        : {
            ok: false,
            message:
              "El modo IA no está disponible ahora mismo. Usa terremoto, explosión o meteorito desde el panel de eventos.",
            actions: [],
          };
    }

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.2,
          max_tokens: 500,
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: data.prompt },
          ],
        }),
      });
      if (!res.ok) return local;
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = body.choices?.[0]?.message?.content ?? "";
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      if (jsonStart < 0 || jsonEnd <= jsonStart) return local;
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as {
        message?: string;
        actions?: unknown;
      };
      const actions = sanitize(parsed.actions);
      if (!actions.length) return local;
      return {
        ok: true,
        message:
          typeof parsed.message === "string" && parsed.message.trim()
            ? parsed.message.trim()
            : local.message,
        actions,
      };
    } catch {
      return local;
    }
  });
