// Configuración compartida por `remotion studio` y `remotion render` (CLI).
// El script `scripts/render.mjs` usa la API programática y replica estos valores.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setCodec("h264");
// CRF bajo = más calidad. 18 es un buen equilibrio para subir a YouTube.
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setOverwriteOutput(true);
