import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tema } from "../tema";

export const EscenaCita: React.FC<{ texto: string; autor: string }> = ({ texto, autor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacidad = interpolate(frame, [0, fps], [0, 1], { extrapolateRight: "clamp" });
  const opacidadAutor = interpolate(frame, [fps, fps * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tema.fondo,
        justifyContent: "center",
        alignItems: "center",
        padding: "0 12%",
        flexDirection: "column",
      }}
    >
      <div style={{ fontFamily: tema.fuenteTitulo, fontSize: 200, color: tema.acento, lineHeight: 0.6 }}>
        “
      </div>
      <p
        style={{
          opacity: opacidad,
          fontFamily: tema.fuenteTitulo,
          fontStyle: "italic",
          fontSize: 68,
          lineHeight: 1.35,
          color: tema.texto,
          textAlign: "center",
        }}
      >
        {texto}
      </p>
      <p
        style={{
          opacity: opacidadAutor,
          fontFamily: tema.fuenteCuerpo,
          fontSize: 32,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: tema.textoSuave,
        }}
      >
        — {autor}
      </p>
    </AbsoluteFill>
  );
};
