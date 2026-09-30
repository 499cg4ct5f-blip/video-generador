import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tema } from "../tema";

const PALABRAS_POR_BLOQUE = 7;

/**
 * Subtítulos quemados en pantalla. Divide la narración en bloques cortos
 * y los reparte uniformemente en la duración del segmento.
 * Si tienes marcas de tiempo reales (p. ej. de Whisper), sustituye este reparto.
 */
export const Subtitulo: React.FC<{ texto: string; duracionFrames: number }> = ({
  texto,
  duracionFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const palabras = texto.split(/\s+/).filter(Boolean);
  const bloques: string[] = [];
  for (let i = 0; i < palabras.length; i += PALABRAS_POR_BLOQUE) {
    bloques.push(palabras.slice(i, i + PALABRAS_POR_BLOQUE).join(" "));
  }
  if (bloques.length === 0) return null;

  const framesPorBloque = duracionFrames / bloques.length;
  const indice = Math.min(bloques.length - 1, Math.floor(frame / framesPorBloque));
  const inicioBloque = indice * framesPorBloque;
  const opacidad = interpolate(frame - inicioBloque, [0, fps * 0.15], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 90 }}>
      <div
        style={{
          opacity: opacidad,
          maxWidth: "75%",
          textAlign: "center",
          fontFamily: tema.fuenteCuerpo,
          fontSize: 44,
          fontWeight: 600,
          lineHeight: 1.3,
          color: tema.texto,
          textShadow: "0 2px 12px rgba(0,0,0,0.9)",
          background: "rgba(0,0,0,0.35)",
          padding: "10px 22px",
          borderRadius: 8,
        }}
      >
        {bloques[indice]}
      </div>
    </AbsoluteFill>
  );
};
