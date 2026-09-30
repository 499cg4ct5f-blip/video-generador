import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { tema } from "../tema";

type Movimiento = "acercar" | "alejar" | "izquierda" | "derecha";

const resolverSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

/** Imagen de archivo con movimiento lento de cámara (efecto Ken Burns). */
export const EscenaImagen: React.FC<{
  src: string;
  movimiento: Movimiento;
  pie?: string;
  duracionFrames: number;
}> = ({ src, movimiento, pie, duracionFrames }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duracionFrames], [0, 1], { extrapolateRight: "clamp" });

  const escala =
    movimiento === "acercar" ? 1 + 0.15 * t : movimiento === "alejar" ? 1.15 - 0.15 * t : 1.12;
  const desplazamientoX =
    movimiento === "izquierda" ? 40 - 80 * t : movimiento === "derecha" ? -40 + 80 * t : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo, overflow: "hidden" }}>
      <Img
        src={resolverSrc(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${escala}) translateX(${desplazamientoX}px)`,
          filter: "sepia(0.25) contrast(1.05)",
        }}
      />
      {pie ? (
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 70,
            fontFamily: tema.fuenteCuerpo,
            fontSize: 28,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: tema.texto,
            borderLeft: `4px solid ${tema.acento}`,
            paddingLeft: 16,
            textShadow: "0 2px 8px rgba(0,0,0,0.9)",
          }}
        >
          {pie}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
