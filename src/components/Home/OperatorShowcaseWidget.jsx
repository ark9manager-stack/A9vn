import { useState } from "react";
import { Play } from "lucide-react";
import { operators, getAvatarUrl, getRarityStars } from "@/data/operators";

// Newest 6★ operators with showcase video search links
const showcase = [...operators]
  .filter((o) => o.rarity === 6)
  .reverse()
  .slice(0, 6)
  .map((op, i) => ({
    ...op,
    code: `RI-OPR-${String(i + 1).padStart(4, "0")}`,
    videoUrl: `https://www.youtube.com/results?search_query=Arknights+${encodeURIComponent(op.name)}+operator+showcase`,
    atk: 700 + ((i * 37) % 250),
    def: 200 + ((i * 23) % 180),
    hp: 2800 + ((i * 91) % 900),
  }));

export default function OperatorShowcaseWidget() {
  const [active, setActive] = useState(0);
  const op = showcase[active];

  return (
    <div className="w-full max-w-[480px] mx-auto bg-card/85 border border-primary/20 relative overflow-hidden">
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--primary)), hsl(var(--accent)), transparent)",
        }}
      />

      {/* Terminal header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-primary/20 bg-black/30">
        <span className="font-mono-tech text-[0.7rem] text-primary tracking-[2px]">
          // OPERATOR_PROFILE.SYS
        </span>
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="w-2.5 h-2.5 rounded-full bg-tier2" />
        </div>
      </div>

      {/* Video / portrait area */}
      <a
        href={op.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block group overflow-hidden"
        style={{
          height: 220,
          background:
            "linear-gradient(180deg, hsl(var(--primary) / 0.15), hsl(220 25% 5%) 100%)",
        }}
      >
        <img
          src={getAvatarUrl(op.id)}
          alt={op.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
        />
        {/* diagonal pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 4px, hsl(var(--primary) / 0.04) 4px, hsl(var(--primary) / 0.04) 5px)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/95 to-transparent" />

        {/* Play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/60 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/40 group-hover:scale-110 transition-all">
            <Play
              size={22}
              className="text-primary ml-1"
              fill="hsl(var(--primary))"
            />
          </div>
        </div>

        <div className="absolute bottom-3 left-4 right-4 z-10">
          <div className="font-mono-tech text-[0.65rem] text-primary tracking-[2px]">
            // {op.code}
          </div>
        </div>
      </a>

      {/* Operator details */}
      <div className="px-6 py-5 grid grid-cols-[120px_1fr] gap-5 items-start">
        <div className="relative w-[120px] h-[150px] border border-primary/20 overflow-hidden bg-gradient-to-b from-primary/15 to-black/50">
          <img
            src={getAvatarUrl(op.id)}
            alt={op.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-1 flex justify-center gap-0.5">
            <span className="text-accent text-[0.65rem]">
              {getRarityStars(op.rarity)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="font-mono-tech text-[0.65rem] text-primary tracking-[2px]">
            // {op.code}
          </div>
          <div className="font-heading text-2xl font-bold text-foreground leading-tight truncate">
            {op.name}
          </div>
          <div className="flex flex-wrap gap-1.5 my-1">
            <span className="font-mono-tech text-[0.6rem] tracking-wider px-2 py-0.5 border border-accent/40 text-accent uppercase">
              {op.class}
            </span>
            <span className="font-mono-tech text-[0.6rem] tracking-wider px-2 py-0.5 border border-border text-muted-foreground uppercase">
              {op.subClass}
            </span>
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {[
              { label: "ATK", val: op.atk, pct: 85, color: "bg-accent" },
              { label: "DEF", val: op.def, pct: 60, color: "bg-primary" },
              { label: "HP", val: op.hp, pct: 72, color: "bg-tier2" },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="font-mono-tech text-[0.6rem] text-muted-foreground w-7">
                  {b.label}
                </span>
                <div className="flex-1 h-1 bg-white/5 relative">
                  <div
                    className={`h-full ${b.color}`}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
                <span className="font-mono-tech text-[0.6rem] text-muted-foreground w-8 text-right">
                  {b.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Terminal feed */}
      <div className="px-5 py-3 border-t border-primary/20 bg-black/25">
        <div className="font-mono-tech text-[0.65rem] text-muted-foreground leading-7">
          <div>
            <span className="text-tier2">[OK]</span> Operator record loaded
          </div>
          <div>
            <span className="text-primary">{op.name.toUpperCase()}</span> —{" "}
            {op.nation.toUpperCase()} / {op.faction.toUpperCase()}
          </div>
          <div>
            <span className="text-accent">[i]</span> Showcase video available{" "}
            <span className="inline-block w-2 h-3 bg-primary ml-0.5 align-middle animate-pulse-dot" />
          </div>
        </div>
      </div>

      {/* Selector strip */}
      <div className="flex border-t border-primary/20 bg-black/40">
        {showcase.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={`flex-1 py-2 px-1 border-r border-primary/10 last:border-r-0 transition-all ${
              i === active ? "bg-primary/15" : "hover:bg-primary/5"
            }`}
            aria-label={`Show ${s.name}`}
          >
            <img
              src={getAvatarUrl(s.id)}
              alt={s.name}
              loading="lazy"
              className={`w-8 h-8 mx-auto rounded object-cover transition-opacity ${
                i === active ? "opacity-100 ring-1 ring-primary" : "opacity-50"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
