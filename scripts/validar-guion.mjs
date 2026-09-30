#!/usr/bin/env node
/**
 * Revisa un guion contra las reglas de retención del README.
 * Uso: npm run validar -- guiones/mi-guion.json
 *
 * Los errores (✖) bloquean el render; las advertencias (⚠) son recomendaciones.
 */
import { pathToFileURL } from "node:url";
import { cargarGuion, contarPalabras, PALABRAS_POR_SEGUNDO } from "./lib/cargar-guion.mjs";

const ROLES = ["gancho", "promesa", "contexto", "escalada", "giro", "climax", "cierre"];
const VISUALES = ["titulo", "imagen", "cita", "dato", "linea-tiempo"];
const MAX_GANCHO_SEG = 15;
const MAX_SEGMENTO_SEG = 20;
const MAX_SIN_INTERRUPCION_SEG = 45;

export function revisarGuion(guion) {
  const errores = [];
  const avisos = [];
  const segmentos = Array.isArray(guion.segmentos) ? guion.segmentos : [];

  if (!guion.titulo) errores.push("Falta `titulo`.");
  if (!/^[a-z0-9-]+$/.test(guion.slug ?? "")) errores.push("`slug` debe usar minúsculas, números y guiones.");
  if (segmentos.length === 0) errores.push("El guion no tiene segmentos.");

  const ids = new Set();
  segmentos.forEach((s, i) => {
    const donde = `segmento ${i + 1} (${s.id ?? "sin id"})`;
    if (!s.id) errores.push(`${donde}: falta \`id\`.`);
    else if (ids.has(s.id)) errores.push(`${donde}: \`id\` duplicado.`);
    ids.add(s.id);
    if (!ROLES.includes(s.rol)) errores.push(`${donde}: \`rol\` debe ser uno de ${ROLES.join(", ")}.`);
    if (!VISUALES.includes(s.visual?.tipo)) errores.push(`${donde}: \`visual.tipo\` debe ser uno de ${VISUALES.join(", ")}.`);
    if (!(s.duracionSegundos > 0)) errores.push(`${donde}: \`duracionSegundos\` debe ser > 0.`);
    if (!s.narracion) {
      avisos.push(`${donde}: sin narración.`);
      return;
    }

    const necesario = contarPalabras(s.narracion) / PALABRAS_POR_SEGUNDO;
    if (necesario > s.duracionSegundos * 1.1) {
      avisos.push(
        `${donde}: la narración necesita ~${necesario.toFixed(1)} s pero dura ${s.duracionSegundos} s. Recorta texto o alarga el segmento.`,
      );
    }
    if (s.duracionSegundos > MAX_SEGMENTO_SEG) {
      avisos.push(`${donde}: ${s.duracionSegundos} s en un mismo plano; divídelo para cambiar de visual cada ≤${MAX_SEGMENTO_SEG} s.`);
    }
  });

  // Reglas de estructura
  if (segmentos[0]?.rol !== "gancho") errores.push("El primer segmento debe tener rol `gancho`.");
  const gancho = segmentos.filter((s) => s.rol === "gancho").reduce((a, s) => a + (s.duracionSegundos || 0), 0);
  if (gancho > MAX_GANCHO_SEG) avisos.push(`El gancho dura ${gancho} s; mantenlo por debajo de ${MAX_GANCHO_SEG} s.`);
  if (!segmentos.some((s) => s.rol === "promesa")) avisos.push("No hay `promesa`: di al espectador qué va a obtener en los primeros 30 s.");
  if (!segmentos.some((s) => s.rol === "giro")) avisos.push("No hay `giro`: añade al menos una revelación que cambie la perspectiva.");
  if (segmentos.at(-1)?.rol !== "cierre") avisos.push("El último segmento debería ser `cierre`.");

  // Interrupciones de patrón: cita, dato o línea de tiempo rompen la monotonía visual.
  let desdeUltima = 0;
  for (const s of segmentos) {
    if (["cita", "dato", "linea-tiempo"].includes(s.visual?.tipo)) desdeUltima = 0;
    else desdeUltima += s.duracionSegundos || 0;
    if (desdeUltima > MAX_SIN_INTERRUPCION_SEG) {
      avisos.push(`Más de ${MAX_SIN_INTERRUPCION_SEG} s sin interrupción de patrón antes de "${s.id}". Inserta una cita, dato o línea de tiempo.`);
      desdeUltima = 0;
    }
  }

  // Visuales consecutivos idénticos
  for (let i = 1; i < segmentos.length; i++) {
    const a = segmentos[i - 1].visual;
    const b = segmentos[i].visual;
    if (a?.tipo === b?.tipo && a?.tipo !== "imagen") {
      avisos.push(`"${segmentos[i - 1].id}" y "${segmentos[i].id}" repiten el visual "${a.tipo}" seguido.`);
    }
  }

  const total = segmentos.reduce((a, s) => a + (s.duracionSegundos || 0), 0);
  return { errores, avisos, total };
}

const formatearDuracion = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

async function main() {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error("Uso: npm run validar -- guiones/mi-guion.json");
    process.exit(1);
  }
  const guion = await cargarGuion(ruta);
  const { errores, avisos, total } = revisarGuion(guion);

  console.log(`\n📜 ${guion.titulo ?? ruta} — ${guion.segmentos?.length ?? 0} segmentos, ${formatearDuracion(total)}\n`);
  errores.forEach((e) => console.log(`  ✖ ${e}`));
  avisos.forEach((a) => console.log(`  ⚠ ${a}`));
  if (errores.length === 0 && avisos.length === 0) console.log("  ✔ Sin problemas.");
  console.log();
  process.exit(errores.length > 0 ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`✖ ${error.message}`);
    process.exit(1);
  });
}
