import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-[#076bdc] select-none">
      {/* Interactive WebGL Cloud Sky Background */}
      <div className="absolute inset-0 z-0">
        <CloudSky
          className="w-full h-full min-h-screen"
          background="#076bdc"
          baseColor="#c0deff"
          accentColor="#FFFFFF"
          density={75}
          speed={55}
          size={135}
          clouds={{ softness: 170, shadow: 60, cirrus: 50 }}
          sun={{ x: 75, y: 90, glow: "rgba(255, 255, 255, 0.95)" }}
          pointer={{ wind: 240, damping: 45, parallax: 260 }}
        />
      </div>

      {/* Atmospheric Cloud Mist & Sun Scatter Depth Behind Text */}
      <div className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center">
        <div
          className="w-[85vw] max-w-5xl h-64 rounded-full blur-3xl opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.25) 0%, rgba(195, 230, 255, 0.12) 45%, transparent 75%)",
          }}
        />
      </div>

      {/* Hero Smoky Text */}
      <div className="relative z-10 w-full px-4 flex items-center justify-center pointer-events-none">
        <SmokyText
          text="PROGENCY"
          color="rgba(255, 255, 255, 0.97)"
          intensity={12}
          position="bottomLeft"
          animationMode="singleLine"
          appearTrigger="default"
          font={{
            fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3.5rem, 13vw, 10rem)",
            letterSpacing: "0.16em",
            textAlign: "center",
            textTransform: "uppercase",
            filter: "drop-shadow(0 14px 30px rgba(4, 45, 100, 0.22))",
          }}
        />
      </div>
    </main>
  );
}
