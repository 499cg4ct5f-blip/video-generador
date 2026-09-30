import { readFile } from "node:fs/promises";
import path from "node:path";

/** Lee un guion JSON desde disco. La validación de esquema la hace Remotion (src/guion/esquema.ts). */
export async function cargarGuion(ruta) {
  const absoluta = path.resolve(ruta);
  let contenido;
  try {
    contenido = await readFile(absoluta, "utf8");
  } catch {
    throw new Error(`No se encontró el guion: ${absoluta}`);
  }
  try {
    return JSON.parse(contenido);
  } catch (error) {
    throw new Error(`El guion no es JSON válido (${absoluta}): ${error.message}`);
  }
}

// Velocidad de locución típica en español para documental: ~150 palabras por minuto.
export const PALABRAS_POR_SEGUNDO = 2.5;

export const contarPalabras = (texto) => texto.split(/\s+/).filter(Boolean).length;
