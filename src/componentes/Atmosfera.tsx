import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/** Viñeta + grano de película para dar textura de archivo histórico. */
export const Atmosfera: React.FC = () => {
  const frame = useCurrentFrame();
  const desplazamiento = Math.floor(random(`grano-${frame}`) * 200);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.07,
          backgroundImage:
            "repeating-radial-gradient(circle at 17% 32%, #fff 0 1px, transparent 1px 3px)",
          backgroundPosition: `${desplazamiento}px ${desplazamiento / 2}px`,
          mixBlendMode: "overlay",
        }}
      />
    </AbsoluteFill>
  );
};
