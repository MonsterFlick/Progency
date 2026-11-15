import CloudSky from "@/components/CloudSky";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-slate-100 flex flex-col justify-between">
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

      {/* Top Navigation */}
      <header className="relative z-10 w-full px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center font-bold text-white shadow-lg">
            P
          </div>
          <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">
            Progency
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90">
          <a
            href="#features"
            className="transition-colors hover:text-white drop-shadow-sm"
          >
            Features
          </a>
          <a
            href="#about"
            className="transition-colors hover:text-white drop-shadow-sm"
          >
            About
          </a>
          <a
            href="#contact"
            className="transition-colors hover:text-white drop-shadow-sm"
          >
            Contact
          </a>
        </nav>

        <button className="relative z-10 px-5 py-2.5 rounded-full text-sm font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/40 shadow-md transition-all active:scale-95">
          Get Started
        </button>
      </header>

      {/* Hero Section Overlay */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold uppercase tracking-wider text-white shadow-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          WebGL Cloud Sky Live
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-md leading-[1.1]">
          Boundless Vision in Every Horizon.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-2xl font-normal drop-shadow-sm leading-relaxed">
          Move your cursor around to direct the wind and feel the interactive
          parallax. The sky is ready for your next sections and features.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button className="px-8 py-3.5 rounded-full font-semibold bg-white text-blue-600 hover:bg-white/95 shadow-xl transition-all active:scale-95 text-base">
            Explore Project
          </button>
          <button className="px-8 py-3.5 rounded-full font-semibold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 shadow-lg transition-all active:scale-95 text-base">
            Documentation
          </button>
        </div>
      </section>

      {/* Bottom Hint */}
      <footer className="relative z-10 w-full px-6 py-6 text-center text-xs text-white/80 drop-shadow-sm">
        Move your mouse over the screen to interact with the wind and clouds.
      </footer>
    </main>
  );
}
