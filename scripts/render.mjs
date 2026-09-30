#!/usr/bin/env node
/**
 * Pipeline de render: valida el guion → empaqueta el proyecto Remotion → renderiza MP4 (y miniatura).
 *
 * Uso:
 *   npm run render -- guiones/mi-guion.json            # vídeo + miniatura
 *   npm run render -- guiones/mi-guion.json --solo-video
 *   npm run render -- guiones/mi-guion.json --miniatura  # solo miniatura
 *   npm run render -- guiones/mi-guion.json --borrador   # 720p, rápido, para revisar
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { cargarGuion } from "./lib/cargar-guion.mjs";
import { revisarGuion } from "./validar-guion.mjs";

const args = process.argv.slice(2);
const ruta = args.find((a) => !a.startsWith("--")) ?? "guiones/ejemplo-caida-de-roma.json";
const soloMiniatura = args.includes("--miniatura");
const soloVideo = args.includes("--solo-video");
const borrador = args.includes("--borrador");

const raiz = path.resolve(import.meta.dirname, "..");
const dirSalida = path.join(raiz, "out");

const guion = await cargarGuion(ruta);
const { errores, avisos } = revisarGuion(guion);
avisos.forEach((a) => console.log(`⚠ ${a}`));
if (errores.length > 0) {
  errores.forEach((e) => console.error(`✖ ${e}`));
  console.error("\nCorrige los errores del guion antes de renderizar.");
  process.exit(1);
}

await mkdir(dirSalida, { recursive: true });
const inputProps = { guion };
// Permite usar un Chrome/Chromium ya instalado en lugar de descargar chrome-headless-shell.
const browserExecutable = process.env.REMOTION_CHROME ?? null;

console.log("📦 Empaquetando proyecto…");
const serveUrl = await bundle({
  entryPoint: path.join(raiz, "src/index.ts"),
  publicDir: path.join(raiz, "public"),
});

if (!soloMiniatura) {
  const composicion = await selectComposition({
    serveUrl,
    id: "EnsayoHistorico",
    inputProps,
    browserExecutable,
  });
  const salida = path.join(dirSalida, `${guion.slug}${borrador ? "-borrador" : ""}.mp4`);
  const segundos = (composicion.durationInFrames / composicion.fps).toFixed(1);
  console.log(`🎬 Renderizando "${guion.titulo}" (${segundos} s, ${composicion.durationInFrames} frames)…`);

  let ultimo = -1;
  await renderMedia({
    serveUrl,
    composition: composicion,
    inputProps,
    codec: "h264",
    crf: borrador ? 28 : 18,
    pixelFormat: "yuv420p",
    imageFormat: "jpeg",
    jpegQuality: 90,
    scale: borrador ? 2 / 3 : 1,
    outputLocation: salida,
    browserExecutable,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 100);
      if (pct !== ultimo && pct % 5 === 0) {
        ultimo = pct;
        process.stdout.write(`\r   ${pct}%`);
      }
    },
  });
  console.log(`\n✔ Vídeo: ${path.relative(raiz, salida)}`);
}

if (!soloVideo && !borrador) {
  const miniatura = await selectComposition({ serveUrl, id: "Miniatura", inputProps, browserExecutable });
  const salida = path.join(dirSalida, `${guion.slug}-miniatura.png`);
  await renderStill({ serveUrl, composition: miniatura, inputProps, output: salida, browserExecutable });
  console.log(`✔ Miniatura: ${path.relative(raiz, salida)}`);
}
