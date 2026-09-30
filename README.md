# video-generador

Pipeline automatizado con **Node.js + [Remotion](https://www.remotion.dev/)** para producir **ensayos visuales e históricos para YouTube**.

Escribes un guion en JSON (narración + visual por segmento). El pipeline lo revisa contra reglas de retención, lo convierte en un vídeo 1080p con subtítulos, transiciones, efecto Ken Burns y textura de archivo, y genera también la miniatura.

```
guiones/*.json ──► validar-guion ──► Remotion (bundle + render) ──► out/<slug>.mp4
                                                                 └─► out/<slug>-miniatura.png
```

---

## Índice

1. [Requisitos e instalación](#1-requisitos-e-instalación)
2. [Estructura del proyecto](#2-estructura-del-proyecto)
3. [Cómo estructurar un guion de alta retención](#3-cómo-estructurar-un-guion-de-alta-retención)
4. [Formato del guion (JSON)](#4-formato-del-guion-json)
5. [Flujo de trabajo y renderizado final](#5-flujo-de-trabajo-y-renderizado-final)
6. [Subir a YouTube](#6-subir-a-youtube)
7. [Cómo ampliar el pipeline](#7-cómo-ampliar-el-pipeline)

---

## 1. Requisitos e instalación

- **Node.js ≥ 20.11**
- Unos 2 GB libres (Remotion descarga su propio Chrome headless y FFmpeg en el primer render)

```bash
npm install
npm run studio        # abre Remotion Studio con el guion de ejemplo
```

> Todos los paquetes `remotion` / `@remotion/*` deben tener **exactamente la misma versión**, y `zod` la versión que exige Remotion. Por eso van fijadas sin `^` en `package.json`. Para actualizar: `npx remotion upgrade`.

---

## 2. Estructura del proyecto

```
video-generador/
├── guiones/                    # Un JSON por vídeo (fuente de verdad del contenido)
│   └── ejemplo-caida-de-roma.json
├── public/                     # Recursos estáticos (se referencian con rutas relativas)
│   ├── imagenes/               # Material de archivo, mapas, pinturas…
│   └── audio/                  # narracion.mp3, musica.mp3
├── scripts/
│   ├── validar-guion.mjs       # Reglas de retención (errores y avisos)
│   ├── render.mjs              # Pipeline: validar → bundle → MP4 → miniatura
│   └── lib/cargar-guion.mjs
├── src/
│   ├── index.ts                # Punto de entrada de Remotion
│   ├── Root.tsx                # Registra composiciones: EnsayoHistorico y Miniatura
│   ├── tema.ts                 # Paleta y tipografías
│   ├── guion/esquema.ts        # Esquema zod del guion (tipos + validación)
│   ├── composiciones/
│   │   ├── EnsayoHistorico.tsx # Encadena segmentos, fundidos, audio y subtítulos
│   │   └── Miniatura.tsx       # Still 1280×720 para YouTube
│   ├── escenas/                # Un componente por tipo de visual
│   │   ├── EscenaTitulo.tsx
│   │   ├── EscenaImagen.tsx    # Ken Burns
│   │   ├── EscenaCita.tsx
│   │   ├── EscenaDato.tsx
│   │   ├── EscenaLineaTiempo.tsx
│   │   └── EscenaSegmento.tsx  # Enruta visual.tipo → escena
│   └── componentes/
│       ├── Subtitulo.tsx
│       └── Atmosfera.tsx       # Viñeta + grano de película
├── out/                        # Renders (ignorado por git)
├── remotion.config.ts
└── package.json
```

La duración, el fps y la resolución del vídeo **no se configuran a mano**: `calculateMetadata` en `Root.tsx` los calcula a partir del guion.

---

## 3. Cómo estructurar un guion de alta retención

En YouTube, la curva de retención decide el alcance. En un ensayo histórico el peligro no es que el tema aburra, sino que el espectador **no sepa por qué debe seguir mirando**. Cada segmento del guion lleva un `rol` que obliga a respetar esta arquitectura:

| # | Rol | Duración orientativa | Objetivo |
|---|-----|----------------------|----------|
| 1 | `gancho` | 5–15 s | Una paradoja, una cifra o una escena concreta. **Nunca** "Hola, bienvenidos a…". |
| 2 | `promesa` | 10–20 s | Qué va a descubrir el espectador y por qué le importa hoy. |
| 3 | `contexto` | 10–20 % del vídeo | Solo lo imprescindible para entender el conflicto. Lugar, época, protagonistas. |
| 4 | `escalada` | 40–50 % del vídeo | Varias subidas de tensión: cada una responde una pregunta y abre otra más grande. |
| 5 | `giro` | 1 o más | Revelación que cambia la interpretación de lo anterior. |
| 6 | `climax` | 5–10 % | El momento decisivo, contado como escena, no como resumen. |
| 7 | `cierre` | 20–40 s | Conclusión + pregunta abierta que conecta con el presente y con el próximo vídeo. |

### Principios de escritura

1. **El gancho en los primeros 5 segundos.** El 20–40 % de la audiencia se decide ahí. Empieza *in medias res*: "En el año 476, el último emperador de Occidente entregó su corona. Nadie se dio cuenta".
2. **Bucles abiertos.** Plantea una pregunta y no la respondas de inmediato ("…pero eso no fue lo más extraño"). Cierra un bucle solo cuando ya hayas abierto el siguiente.
3. **Especificidad > generalidad.** Fechas, nombres, cifras, objetos. "Odoacro envió las insignias imperiales a Constantinopla" retiene más que "el imperio llegó a su fin".
4. **Interrupciones de patrón cada 30–45 s.** Cambia el tipo de visual: una cita, un dato a pantalla completa o una línea de tiempo resetean la atención. El validador avisa si pasan más de 45 s sin una.
5. **Un plano ≤ 20 s.** Divide los segmentos largos; cambiar de imagen es barato y mantiene el ritmo.
6. **Frases para el oído.** Oraciones cortas, voz activa y una idea por frase. Lee el guion en voz alta.
7. **Ritmo de locución: ~150 palabras/min (2,5 palabras/s).** El validador comprueba que la narración cabe en `duracionSegundos`.
8. **Sin despedidas largas.** La gente se va en cuanto nota que el vídeo termina. Llama a suscribirse *dentro* de la pregunta final, no después.
9. **Rigor.** Cita fuentes primarias en las `cita`s y guarda la bibliografía para la descripción del vídeo. En contenido histórico, la credibilidad también retiene.

### Plantilla de esqueleto

```
GANCHO     → Paradoja o escena concreta              (dato / imagen)
PROMESA    → "Hoy vamos a descubrir…"                (titulo)
CONTEXTO   → Dónde, cuándo, quién                    (imagen, linea-tiempo)
ESCALADA 1 → Primera causa / primer conflicto        (imagen)
ESCALADA 2 → Complicación: "pero había algo más"     (dato)
ESCALADA 3 → Consecuencia inesperada                 (imagen)
GIRO       → Lo que cambia la lectura de todo        (cita)
CLÍMAX     → El momento decisivo, narrado como escena (imagen)
CIERRE     → Lección + pregunta abierta + suscripción (titulo)
```

Para un vídeo de 10–15 minutos, repite el bloque de escaladas (2–4 escaladas por acto) e introduce un mini-giro al final de cada acto.

---

## 4. Formato del guion (JSON)

El esquema completo está en [`src/guion/esquema.ts`](src/guion/esquema.ts). Ejemplo mínimo:

```json
{
  "titulo": "Roma no cayó en un día",
  "slug": "roma-no-cayo-en-un-dia",
  "fps": 30,
  "ancho": 1920,
  "alto": 1080,
  "audioNarracion": "audio/narracion.mp3",
  "musica": "audio/musica.mp3",
  "volumenMusica": 0.12,
  "subtitulos": true,
  "transicionSegundos": 0.6,
  "segmentos": [
    {
      "id": "gancho",
      "rol": "gancho",
      "narracion": "En el año 476, el último emperador de Occidente entregó su corona…",
      "duracionSegundos": 9,
      "visual": { "tipo": "dato", "cifra": "476 d. C.", "descripcion": "Y casi nadie lo notó" }
    }
  ]
}
```

### Campos generales

| Campo | Obligatorio | Por defecto | Descripción |
|-------|:-----------:|-------------|-------------|
| `titulo` | ✔ | — | Título del vídeo (se usa también en la miniatura). |
| `slug` | ✔ | — | Nombre del archivo de salida. Minúsculas, números y guiones. |
| `fps`, `ancho`, `alto` | | 30, 1920, 1080 | Formato del vídeo. Para 4K: 3840×2160. |
| `audioNarracion` | | — | Pista de voz completa, relativa a `public/`. |
| `musica`, `volumenMusica` | | —, 0.12 | Música de fondo en bucle. |
| `subtitulos` | | `true` | Subtítulos quemados con la narración. |
| `transicionSegundos` | | 0.6 | Fundido de entrada y salida de cada segmento. |

### Tipos de `visual`

| `tipo` | Campos | Uso recomendado |
|--------|--------|-----------------|
| `titulo` | `titulo`, `subtitulo?` | Promesa, cambios de capítulo, cierre. |
| `imagen` | `src`, `movimiento` (`acercar`·`alejar`·`izquierda`·`derecha`), `pie?` | La mayor parte del vídeo: pinturas, mapas, fotografías, grabados. |
| `cita` | `texto`, `autor` | Fuentes primarias; ideal para giros. |
| `dato` | `cifra`, `descripcion` | Ganchos e interrupciones de patrón. |
| `linea-tiempo` | `hitos: [{ fecha, evento }]` (mín. 2) | Contexto y cronologías. |

`src` acepta una ruta relativa a `public/` o una URL `https://`. Las imágenes de `public/imagenes/` son **marcadores de posición**: sustitúyelas por material de dominio público (Wikimedia Commons, bibliotecas y museos con licencias abiertas) o con licencia.

### Sincronizar con la narración

Si usas `audioNarracion`, ajusta cada `duracionSegundos` a lo que dura realmente ese fragmento de voz. Truco: graba o genera la locución **segmento a segmento**, mide cada clip (`npx remotion ffprobe clip.mp3`) y copia las duraciones al JSON antes de unir los clips en `narracion.mp3`.

---

## 5. Flujo de trabajo y renderizado final

### Paso 1 — Escribir y validar el guion

```bash
cp guiones/ejemplo-caida-de-roma.json guiones/mi-ensayo.json
# edita el archivo…
npm run validar -- guiones/mi-ensayo.json
```

- `✖` **Errores** (bloquean el render): campos inválidos, ids duplicados, primer segmento sin `gancho`…
- `⚠` **Avisos** (recomendaciones): narración que no cabe en su duración, gancho > 15 s, más de 45 s sin interrupción de patrón, visuales repetidos, falta de `promesa`/`giro`/`cierre`.

### Paso 2 — Previsualizar en Remotion Studio

```bash
npm run studio
```

Abre `http://localhost:3000`. El Studio carga el guion de ejemplo; para ver el tuyo, cambia el `import` de `src/Root.tsx` o pega tu JSON en el panel de *props* de la composición `EnsayoHistorico`. Cada segmento aparece en la línea de tiempo con su `rol` e `id`.

### Paso 3 — Borrador rápido

```bash
npm run render -- guiones/mi-ensayo.json --borrador
```

Renderiza en 720p con menos calidad (`out/<slug>-borrador.mp4`) para revisar ritmo y subtítulos sin esperar al render final.

### Paso 4 — Render final

```bash
npm run render -- guiones/mi-ensayo.json
```

Genera:

- `out/<slug>.mp4` — H.264, 1080p, `yuv420p`, CRF 18 (calidad alta, adecuada para subir a YouTube).
- `out/<slug>-miniatura.png` — 1280×720 a partir del título y la primera imagen del guion.

Opciones:

| Opción | Efecto |
|--------|--------|
| `--borrador` | 720p, CRF 28, sin miniatura. |
| `--solo-video` | Omite la miniatura. |
| `--miniatura` | Solo la miniatura. |

Variables de entorno:

| Variable | Uso |
|----------|-----|
| `REMOTION_CHROME` | Ruta a un Chrome/Chromium headless ya instalado, para no descargar uno (útil en CI o contenedores). |

### Alternativa: CLI de Remotion

```bash
npx remotion render src/index.ts EnsayoHistorico out/video.mp4 --props='{"guion": '"$(cat guiones/mi-ensayo.json)"'}'
npx remotion still  src/index.ts Miniatura out/miniatura.png --props='{"guion": '"$(cat guiones/mi-ensayo.json)"'}'
```

La CLI usa `remotion.config.ts` (mismo códec y calidad), pero no ejecuta el validador de retención.

---

## 6. Subir a YouTube

- **Formato**: el MP4 generado cumple las recomendaciones de YouTube (H.264, `yuv420p`, 30 fps; audio AAC cuando el guion incluye narración o música).
- **Miniatura**: 1280×720 PNG, máx. 2 MB. Pocas palabras (3–5) y contraste alto.
- **Capítulos**: los `id` y tiempos de los segmentos sirven como base para los capítulos de la descripción (`0:00 Gancho`, `0:20 Contexto`…).
- **Subtítulos**: además de los quemados, sube un `.srt` con la narración para mejorar la accesibilidad y el SEO.
- **Fuentes**: añade la bibliografía y los créditos de las imágenes en la descripción.

---

## 7. Cómo ampliar el pipeline

- **Nuevo tipo de visual** (mapa animado, comparación, documento):
  1. Añade el esquema en `src/guion/esquema.ts` dentro de `visual`.
  2. Crea la escena en `src/escenas/`.
  3. Añade el `case` en `EscenaSegmento.tsx` (TypeScript avisará si falta).
  4. Añade el tipo a `VISUALES` en `scripts/validar-guion.mjs`.
- **Voz sintética (TTS)**: añade un script `scripts/generar-voz.mjs` que lea `narracion` de cada segmento, genere un clip por segmento y rellene `duracionSegundos` automáticamente.
- **Subtítulos con tiempos reales**: transcribe la locución (p. ej. con `@remotion/install-whisper-cpp`) y sustituye el reparto uniforme de `Subtitulo.tsx` por las marcas de tiempo de cada palabra.
- **Formatos verticales (Shorts)**: registra otra `<Composition>` en `Root.tsx` con 1080×1920 que reutilice las mismas escenas.
- **Tipografías**: carga fuentes con `@remotion/google-fonts` y actualiza `src/tema.ts`.

---

### Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run studio` | Previsualización interactiva. |
| `npm run validar -- <guion>` | Revisión de reglas de retención. |
| `npm run render -- <guion> [opciones]` | Pipeline completo de render. |
| `npm run render:ejemplo` | Renderiza el guion de ejemplo. |
| `npm run miniatura` | Solo la miniatura del guion de ejemplo. |
| `npm run typecheck` | Comprobación de tipos con TypeScript. |
