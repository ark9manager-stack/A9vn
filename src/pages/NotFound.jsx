import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  const subtitleLines = [
    "Doctor...",
    "This route does not exist in our records.",
    "It's like this place was never meant to be found.",
    "Or perhaps...",
    "you weren't supposed to come here.",
  ];

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
    setVisible(true);
  }, [location.pathname]);

  useEffect(() => {
    if (lineIndex < subtitleLines.length) {
      const timer = setTimeout(() => setLineIndex((i) => i + 1), 900);
      return () => clearTimeout(timer);
    }
  }, [lineIndex, subtitleLines.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-background">
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }}
      />

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.03) 2px, hsl(var(--foreground) / 0.03) 4px)",
        }}
      />

      {/* Slow drifting gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-1/4 top-1/4 h-[600px] w-[600px] rounded-full opacity-[0.07] blur-[120px] animate-[drift_20s_ease-in-out_infinite]"
          style={{ background: "hsl(var(--primary))" }}
        />
        <div
          className="absolute -right-1/4 bottom-1/4 h-[500px] w-[500px] rounded-full opacity-[0.05] blur-[100px] animate-[drift_25s_ease-in-out_infinite_reverse]"
          style={{ background: "hsl(var(--accent))" }}
        />
      </div>

      {/* Glitch bar */}
      <div
        className="pointer-events-none absolute left-0 right-0 h-[2px] opacity-20 animate-[glitch-bar_4s_ease-in-out_infinite]"
        style={{ background: "hsl(var(--primary))", top: "30%" }}
      />

      {/* Main content */}
      <div
        className={`relative z-10 max-w-2xl px-6 text-center transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* Error code */}
        <div className="mb-2 font-heading text-sm font-medium tracking-[0.4em] text-muted-foreground uppercase">
          Rhodes Island · Terminal
        </div>

        <h1 className="relative mb-8 font-heading text-5xl font-bold tracking-wider text-foreground sm:text-6xl md:text-7xl animate-[flicker_3s_ease-in-out_infinite]">
          <span className="relative">
            ERROR 404
            <span
              className="absolute inset-0 text-primary opacity-40 blur-[2px]"
              aria-hidden
            >
              ERROR 404
            </span>
          </span>
          <span className="mt-1 block text-2xl tracking-[0.3em] text-primary sm:text-3xl">
            — SIGNAL LOST —
          </span>
        </h1>

        {/* Subtitle lines */}
        <div className="mb-12 min-h-[180px] space-y-3">
          {subtitleLines.map((line, i) => (
            <p
              key={i}
              className={`font-body text-base leading-relaxed transition-all duration-700 sm:text-lg ${
                i < lineIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3"
              } ${
                i === 0 || i === 3
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              } ${i === 4 ? "italic" : ""}`}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Waveform */}
        <div className="mx-auto mb-10 flex h-8 w-48 items-center justify-center gap-[3px]">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-primary/30"
              style={{
                animation: `wave 1.5s ease-in-out ${i * 0.06}s infinite`,
                height: "4px",
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <button
            onClick={() => navigate("/")}
            className="group relative font-heading text-sm font-semibold tracking-wider uppercase px-8 py-3 rounded-md bg-primary text-primary-foreground transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
          >
            Return to Base
          </button>
          <button
            onClick={() => navigate(-1)}
            className="font-heading text-sm font-semibold tracking-wider uppercase px-8 py-3 rounded-md border border-border text-muted-foreground transition-all duration-300 hover:border-primary/50 hover:text-foreground hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
          >
            Go Back
          </button>
        </div>

        {/* Route info */}
        <p className="mt-8 font-mono text-xs text-muted-foreground/40 tracking-wider">
          ROUTE: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
