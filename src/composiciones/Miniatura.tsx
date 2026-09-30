import { AbsoluteFill } from "remotion";
import { Atmosfera } from "../componentes/Atmosfera";
import { EscenaImagen } from "../escenas/EscenaImagen";
import type { Guion } from "../guion/esquema";
import { tema } from "../tema";

/** Miniatura 1280×720 generada a partir del primer visual de imagen del guion. */
export const Miniatura: React.FC<{ guion: Guion }> = ({ guion }) => {
  const imagen = guion.segmentos.map((s) => s.visual).find((v) => v.tipo === "imagen");

  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo }}>
      {imagen && imagen.tipo === "imagen" ? (
        <EscenaImagen src={imagen.src} movimiento="acercar" duracionFrames={1} />
      ) : null}
      <AbsoluteFill
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 70%)",
          justifyContent: "center",
          padding: "0 6%",
        }}
      >
        <div
          style={{
            fontFamily: tema.fuenteTitulo,
            fontSize: 110,
            fontWeight: 700,
            lineHeight: 1.05,
            color: tema.texto,
            maxWidth: "65%",
            textShadow: "0 4px 20px rgba(0,0,0,0.8)",
          }}
        >
          {guion.titulo}
        </div>
      </AbsoluteFill>
      <Atmosfera />
    </AbsoluteFill>
  );
};
