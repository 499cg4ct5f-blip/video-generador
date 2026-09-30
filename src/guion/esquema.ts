import { z } from "zod";

/**
 * Roles narrativos de cada segmento. Siguen la estructura de retención
 * descrita en el README: gancho → promesa → contexto → escaladas → giro → clímax → cierre.
 */
export const rolSegmento = z.enum([
  "gancho",
  "promesa",
  "contexto",
  "escalada",
  "giro",
  "climax",
  "cierre",
]);

const visualTitulo = z.object({
  tipo: z.literal("titulo"),
  titulo: z.string(),
  subtitulo: z.string().optional(),
});

const visualImagen = z.object({
  tipo: z.literal("imagen"),
  /** Ruta relativa a /public (p. ej. "imagenes/foro.jpg") o URL absoluta. */
  src: z.string(),
  /** Movimiento de cámara estilo Ken Burns. */
  movimiento: z.enum(["acercar", "alejar", "izquierda", "derecha"]).default("acercar"),
  pie: z.string().optional(),
});

const visualCita = z.object({
  tipo: z.literal("cita"),
  texto: z.string(),
  autor: z.string(),
});

const visualDato = z.object({
  tipo: z.literal("dato"),
  /** Cifra grande en pantalla (p. ej. "476 d. C." o "1.000.000"). */
  cifra: z.string(),
  descripcion: z.string(),
});

const visualLineaTiempo = z.object({
  tipo: z.literal("linea-tiempo"),
  hitos: z
    .array(z.object({ fecha: z.string(), evento: z.string() }))
    .min(2),
});

export const visual = z.discriminatedUnion("tipo", [
  visualTitulo,
  visualImagen,
  visualCita,
  visualDato,
  visualLineaTiempo,
]);

export const segmento = z.object({
  id: z.string(),
  rol: rolSegmento,
  /** Texto que dice el narrador. Se muestra como subtítulo si `subtitulos` está activo. */
  narracion: z.string(),
  duracionSegundos: z.number().positive(),
  visual,
});

export const guion = z.object({
  titulo: z.string(),
  /** Nombre del archivo final en /out (sin extensión). */
  slug: z.string().regex(/^[a-z0-9-]+$/, "usa minúsculas, números y guiones"),
  fps: z.number().int().positive().default(30),
  ancho: z.number().int().positive().default(1920),
  alto: z.number().int().positive().default(1080),
  /** Pista de narración completa en /public (opcional). */
  audioNarracion: z.string().optional(),
  /** Música de fondo en /public (opcional). */
  musica: z.string().optional(),
  volumenMusica: z.number().min(0).max(1).default(0.12),
  subtitulos: z.boolean().default(true),
  /** Segundos de fundido entre segmentos. */
  transicionSegundos: z.number().min(0).default(0.6),
  segmentos: z.array(segmento).min(1),
});

export type Guion = z.infer<typeof guion>;
export type GuionEntrada = z.input<typeof guion>;
export type Segmento = z.infer<typeof segmento>;
export type Visual = z.infer<typeof visual>;
export type RolSegmento = z.infer<typeof rolSegmento>;

export const duracionTotalSegundos = (g: Pick<Guion, "segmentos">) =>
  g.segmentos.reduce((acc, s) => acc + s.duracionSegundos, 0);
