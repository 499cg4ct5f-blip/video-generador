import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Atmosfera } from "../componentes/Atmosfera";
import { Subtitulo } from "../componentes/Subtitulo";
import { EscenaSegmento } from "../escenas/EscenaSegmento";
import type { Guion, Segmento } from "../guion/esquema";
import { tema } from "../tema";

const Fundido: React.FC<{
  duracionFrames: number;
  transicionFrames: number;
  children: React.ReactNode;
}> = ({ duracionFrames, transicionFrames, children }) => {
  const frame = useCurrentFrame();
  const t = Math.max(1, Math.min(transicionFrames, Math.floor(duracionFrames / 2)));
  const opacidad = interpolate(
    frame,
    [0, t, duracionFrames - t, duracionFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity: opacidad }}>{children}</AbsoluteFill>;
};

const aFrames = (segundos: number, fps: number) => Math.max(1, Math.round(segundos * fps));

export const EnsayoHistorico: React.FC<{ guion: Guion }> = ({ guion }) => {
  const { fps } = guion;
  const transicionFrames = aFrames(guion.transicionSegundos, fps);

  let inicio = 0;
  const bloques = guion.segmentos.map((segmento: Segmento) => {
    const duracion = aFrames(segmento.duracionSegundos, fps);
    const bloque = { segmento, inicio, duracion };
    inicio += duracion;
    return bloque;
  });

  return (
    <AbsoluteFill style={{ backgroundColor: tema.fondo }}>
      {bloques.map(({ segmento, inicio, duracion }) => (
        <Sequence key={segmento.id} from={inicio} durationInFrames={duracion} name={`${segmento.rol}: ${segmento.id}`}>
          <Fundido duracionFrames={duracion} transicionFrames={transicionFrames}>
            <EscenaSegmento visual={segmento.visual} duracionFrames={duracion} />
          </Fundido>
          {guion.subtitulos ? (
            <Subtitulo texto={segmento.narracion} duracionFrames={duracion} />
          ) : null}
        </Sequence>
      ))}

      <Atmosfera />

      {guion.audioNarracion ? <Audio src={staticFile(guion.audioNarracion)} /> : null}
      {guion.musica ? (
        <Audio src={staticFile(guion.musica)} volume={guion.volumenMusica} loop />
      ) : null}
    </AbsoluteFill>
  );
};
