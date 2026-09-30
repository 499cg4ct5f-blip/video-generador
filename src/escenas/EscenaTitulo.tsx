import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { tema } from "../tema";

export const EscenaTitulo: React.FC<{ titulo: string; subtitulo?: string }> = ({
  titulo,
  subtitulo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 200 } });
  const linea = interpolate(frame, [fps * 0.3, fps * 1.2], [0, 320], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tema.fondo,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: tema.fuenteTitulo,
          fontSize: 120,
          fontWeight: 600,
          color: tema.texto,
          letterSpacing: 2,
          textAlign: "center",
          maxWidth: "80%",
          opacity: entrada,
          transform: `translateY(${(1 - entrada) * 30}px)`,
        }}
      >
        {titulo}
      </h1>
      <div style={{ width: linea, height: 3, backgroundColor: tema.acento }} />
      {subtitulo ? (
        <p
          style={{
            margin: 0,
            fontFamily: tema.fuenteCuerpo,
            fontSize: 40,
            color: tema.textoSuave,
            opacity: interpolate(frame, [fps * 0.8, fps * 1.5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {subtitulo}
        </p>
      ) : null}
    </AbsoluteFill>
  );
};
