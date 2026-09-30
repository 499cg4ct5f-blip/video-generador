import { Composition, Still } from "remotion";
import guionEjemplo from "../guiones/ejemplo-caida-de-roma.json";
import { EnsayoHistorico } from "./composiciones/EnsayoHistorico";
import { Miniatura } from "./composiciones/Miniatura";
import { duracionTotalSegundos, guion as esquemaGuion, type Guion } from "./guion/esquema";

type Props = { guion: Guion };

// El guion de ejemplo se usa como valor por defecto en Remotion Studio.
// Al renderizar, scripts/render.mjs sustituye `guion` por el archivo indicado.
const porDefecto: Props = { guion: esquemaGuion.parse(guionEjemplo) };

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="EnsayoHistorico"
      component={EnsayoHistorico}
      defaultProps={porDefecto}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={({ props }) => {
        const guion = esquemaGuion.parse(props.guion);
        return {
          props: { guion },
          fps: guion.fps,
          width: guion.ancho,
          height: guion.alto,
          durationInFrames: Math.round(duracionTotalSegundos(guion) * guion.fps),
        };
      }}
    />
    <Still
      id="Miniatura"
      component={Miniatura}
      defaultProps={porDefecto}
      width={1280}
      height={720}
      calculateMetadata={({ props }) => ({ props: { guion: esquemaGuion.parse(props.guion) } })}
    />
  </>
);
