import type { Visual } from "../guion/esquema";
import { EscenaCita } from "./EscenaCita";
import { EscenaDato } from "./EscenaDato";
import { EscenaImagen } from "./EscenaImagen";
import { EscenaLineaTiempo } from "./EscenaLineaTiempo";
import { EscenaTitulo } from "./EscenaTitulo";

/** Elige la escena correspondiente al tipo de visual del segmento. */
export const EscenaSegmento: React.FC<{ visual: Visual; duracionFrames: number }> = ({
  visual,
  duracionFrames,
}) => {
  switch (visual.tipo) {
    case "titulo":
      return <EscenaTitulo titulo={visual.titulo} subtitulo={visual.subtitulo} />;
    case "imagen":
      return (
        <EscenaImagen
          src={visual.src}
          movimiento={visual.movimiento}
          pie={visual.pie}
          duracionFrames={duracionFrames}
        />
      );
    case "cita":
      return <EscenaCita texto={visual.texto} autor={visual.autor} />;
    case "dato":
      return <EscenaDato cifra={visual.cifra} descripcion={visual.descripcion} />;
    case "linea-tiempo":
      return <EscenaLineaTiempo hitos={visual.hitos} duracionFrames={duracionFrames} />;
  }
};
