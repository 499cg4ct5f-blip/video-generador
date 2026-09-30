import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tema } from "../tema";

export const EscenaLineaTiempo: React.FC<{
  hitos: { fecha: string; evento: string }[];
  duracionFrames: number;
}> = ({ hitos, duracionFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Los hitos aparecen escalonados durante el primer 70 % de la escena.
  const ventana = duracionFrames * 0.7;
  const progresoLinea = interpolate(frame, [0, ventana], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo, justifyContent: "center", padding: "0 12%" }}>
      <div style={{ position: "relative", height: 400 }}>
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 0,
            height: 4,
            width: `${progresoLinea}%`,
            backgroundColor: tema.acento,
          }}
        />
        {hitos.map((hito, i) => {
          const x = hitos.length === 1 ? 50 : (i / (hitos.length - 1)) * 100;
          const aparicion = (i / hitos.length) * ventana;
          const opacidad = interpolate(frame, [aparicion, aparicion + fps * 0.5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const arriba = i % 2 === 0;
          return (
            <div
              key={`${hito.fecha}-${i}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: arriba ? 30 : 230,
                transform: "translateX(-50%)",
                width: 360,
                textAlign: "center",
                opacity: opacidad,
              }}
            >
              <div style={{ fontFamily: tema.fuenteTitulo, fontSize: 56, color: tema.acento, fontWeight: 700 }}>
                {hito.fecha}
              </div>
              <div style={{ fontFamily: tema.fuenteCuerpo, fontSize: 30, color: tema.texto }}>
                {hito.evento}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
