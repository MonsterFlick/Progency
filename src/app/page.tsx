import CloudSky from "@/components/CloudSky";
import SmokyText from "@/components/SmokyText";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-sky-900 select-none">
      {/* Interactive WebGL Cloud Sky Background */}
      <div className="absolute inset-0 z-0">
        <CloudSky
          className="w-full h-full min-h-screen"
          background="#0075FF"
          baseColor="#B4D2F0"
          accentColor="#FFFFFF"
          density={85}
          speed={60}
          size={140}
        />
      </div>

      {/* Hero Smoky Text */}
      <div className="relative z-10 w-full px-4 flex items-center justify-center pointer-events-auto">
        <SmokyText
          text="PROGENCY"
          color="#FFFFFF"
          intensity={12}
          position="bottomLeft"
          animationMode="singleLine"
          appearTrigger="default"
          font={{
            fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(3rem, 13vw, 10rem)",
            letterSpacing: "0.12em",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        />
      </div>
    </main>
  );
}
