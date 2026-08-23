import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, FileImage, Layers3 } from "lucide-react";

// Connect this collection to the main-story data source later.
// Supported fields: id, episode, title, subtitle, cover, stages.
const mainStoryRecords = [];
const emptySlots = Array.from({ length: 8 }, (_, index) => ({
  id: `pending-${index + 1}`,
  episode: `EP ${String(index + 1).padStart(2, "0")}`,
  title: "AWAITING RECORD",
  subtitle: "Content will be loaded from the story data source.",
  stages: "—",
}));

const fallbackBackgrounds = [
  "radial-gradient(circle at 72% 16%, rgba(74, 176, 220, .32), transparent 28%), linear-gradient(135deg, #14222b, #070a0e 68%)",
  "radial-gradient(circle at 24% 22%, rgba(129, 92, 190, .28), transparent 27%), linear-gradient(135deg, #161525, #07090d 68%)",
  "radial-gradient(circle at 78% 74%, rgba(211, 125, 61, .25), transparent 28%), linear-gradient(135deg, #281b14, #09090c 68%)",
  "radial-gradient(circle at 34% 78%, rgba(61, 147, 125, .24), transparent 26%), linear-gradient(135deg, #10231f, #070a0b 68%)",
];

function coverBackground(record, index) {
  return record.cover ? `url("${record.cover}")` : fallbackBackgrounds[index % fallbackBackgrounds.length];
}

export default function MainPath() {
  const railRef = useRef(null);
  const cardsRef = useRef([]);
  const episodes = useMemo(() => mainStoryRecords.length ? mainStoryRecords : emptySlots, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeEpisode = episodes[activeIndex] ?? episodes[0];

  const selectEpisode = (index, shouldScroll = true) => {
    setActiveIndex(index);
    if (shouldScroll) cardsRef.current[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const updateActiveFromScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    const railCenter = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;
    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - railCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    setActiveIndex((current) => current === closestIndex ? current : closestIndex);
  };

  const moveRail = (direction) => selectEpisode(Math.max(0, Math.min(episodes.length - 1, activeIndex + direction)));

  return <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#06090d] text-foreground">
    <div className="pointer-events-none absolute inset-0 transition-opacity duration-700" style={{ backgroundImage: coverBackground(activeEpisode, activeIndex), backgroundPosition: "center", backgroundSize: "cover", filter: "blur(10px) saturate(.7)", opacity: activeEpisode?.cover ? 0.38 : 0.7, transform: "scale(1.07)" }} />
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,6,9,.96)_0%,rgba(4,6,9,.75)_32%,rgba(4,6,9,.55)_68%,rgba(4,6,9,.94)_100%),linear-gradient(180deg,rgba(3,5,8,.5),rgba(3,5,8,.9)_82%,#06090d)]" />
    <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(170,220,250,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(170,220,250,.045)_1px,transparent_1px)] [background-size:42px_42px]" />

    <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1800px] flex-col px-4 py-5 sm:px-6 lg:px-10">
      <header className="flex items-center justify-between gap-4">
        <Link to="/story" className="inline-flex items-center gap-2 border border-white/15 bg-black/35 px-3 py-2 font-mono-tech text-[0.6rem] tracking-[1.5px] text-white/60 backdrop-blur-sm transition-colors hover:border-primary/55 hover:text-primary"><ArrowLeft size={14} /> STORY ARCHIVE</Link>
        <div className="hidden font-mono-tech text-[0.6rem] tracking-[1.8px] text-white/40 sm:block">MAINPATH // {String(activeIndex + 1).padStart(2, "0")} / {String(episodes.length).padStart(2, "0")}</div>
      </header>

      <section className="mt-10 shrink-0 sm:mt-14"><div className="flex items-center gap-3 font-mono-tech text-[0.62rem] tracking-[2px] text-primary"><span className="h-px w-7 bg-primary/70" /> MAIN STORY / MAIN THEME</div><h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-[2px] text-white sm:text-6xl">{activeEpisode?.title}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/55">{activeEpisode?.subtitle}</p></section>

      <section className="relative mt-auto pb-5 pt-10 sm:pb-8 sm:pt-12"><div className="mb-4 flex items-end justify-between gap-4"><div><div className="font-mono-tech text-[0.6rem] tracking-[1.7px] text-white/40">{activeEpisode?.episode} // {activeEpisode?.stages ?? "—"} STAGES</div><div className="mt-1 font-heading text-xl font-bold tracking-[1px] text-white/90">EPISODE SELECTION</div></div><div className="flex gap-2"><button type="button" onClick={() => moveRail(-1)} disabled={activeIndex === 0} aria-label="Previous episode" className="flex h-9 w-9 items-center justify-center border border-white/15 bg-black/35 text-white/60 backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><ChevronLeft size={18} /></button><button type="button" onClick={() => moveRail(1)} disabled={activeIndex === episodes.length - 1} aria-label="Next episode" className="flex h-9 w-9 items-center justify-center border border-white/15 bg-black/35 text-white/60 backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><ChevronRight size={18} /></button></div></div>
        <div className="pointer-events-none absolute left-0 right-0 top-[53%] hidden h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent lg:block" />
        <div ref={railRef} onScroll={updateActiveFromScroll} className="a9-scroll -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc((100vw-1300px)/2))] pb-4 pt-2 sm:-mx-6 sm:px-[max(1.5rem,calc((100vw-1300px)/2))] lg:-mx-10 lg:gap-6 lg:px-[max(2.5rem,calc((100vw-1450px)/2))]">
          {episodes.map((episode, index) => {
            const active = index === activeIndex;
            return <button key={episode.id} ref={(node) => { cardsRef.current[index] = node; }} type="button" onClick={() => selectEpisode(index)} className={`group relative w-[205px] shrink-0 snap-center overflow-hidden border text-left transition-all duration-500 sm:w-[235px] lg:w-[260px] ${active ? "z-10 -translate-y-3 scale-[1.035] border-primary/80 shadow-[0_0_32px_hsl(var(--primary)/0.26)]" : "border-white/20 opacity-55 hover:opacity-85"}`} style={{ aspectRatio: "3 / 4.2" }}>
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: coverBackground(episode, index) }} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,10,.05),rgba(3,7,10,.28)_40%,rgba(3,7,10,.94)_100%)]" />
              <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.06)_0px,rgba(255,255,255,.06)_1px,transparent_1px,transparent_9px)]" />
              <div className="relative flex h-full flex-col p-4"><div className="flex items-start justify-between"><span className={`border px-2 py-1 font-mono-tech text-[0.55rem] tracking-[1.3px] ${active ? "border-primary/60 bg-primary/15 text-primary" : "border-white/20 bg-black/35 text-white/50"}`}>{episode.episode}</span>{!episode.cover && <FileImage size={17} className="text-white/25" />}</div><div className="mt-auto"><div className="font-mono-tech text-[0.55rem] tracking-[1.4px] text-primary/80">MAINPATH</div><h2 className="mt-2 font-heading text-xl font-bold uppercase leading-[.95] tracking-[1px] text-white sm:text-2xl">{episode.title}</h2><div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3 font-mono-tech text-[0.55rem] tracking-[1.3px] text-white/45"><span>{episode.stages ?? "—"} STAGES</span><ChevronRight size={15} className={active ? "text-primary" : ""} /></div></div></div>
            </button>;
          })}
        </div>
        <div className="mt-1 flex items-center gap-3 font-mono-tech text-[0.58rem] tracking-[1.4px] text-white/35"><Layers3 size={13} className="text-primary/70" /> HORIZONTAL STORY RAIL <span className="hidden sm:inline">// SCROLL OR USE ARROWS TO SELECT AN EPISODE</span></div>
      </section>
    </div>
  </main>;
}
