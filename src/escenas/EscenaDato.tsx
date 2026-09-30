import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { tema } from "../tema";

/** Cifra grande a pantalla completa: funciona como "interrupción de patrón". */
export const EscenaDato: React.FC<{ cifra: string; descripcion: string }> = ({
  cifra,
  descripcion,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const golpe = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: tema.fondo,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          fontFamily: tema.fuenteTitulo,
          fontSize: 220,
          fontWeight: 700,
          color: tema.acento,
          transform: `scale(${0.7 + 0.3 * golpe})`,
          opacity: golpe,
        }}
      >
        {cifra}
      </div>
      <div
        style={{
          fontFamily: tema.fuenteCuerpo,
          fontSize: 44,
          color: tema.texto,
          maxWidth: "70%",
          textAlign: "center",
        }}
      >
        {descripcion}
      </div>
    </AbsoluteFill>
  );
};
