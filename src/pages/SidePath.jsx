import { Link } from "react-router-dom";
import { Archive, ArrowLeft, ChevronRight, MapPinned } from "lucide-react";

// Connect this to the side-story source later.
// Shape: { id, name, code, cover, stories: [{ id, title, cover, type, chapters }] }
const sideStoryRegions = [];
const regionSlots = Array.from({ length: 4 }, (_, index) => ({
  id: `region-slot-${index + 1}`,
  name: "AWAITING REGION",
  code: `REGION_${String(index + 1).padStart(2, "0")}`,
  stories: Array.from({ length: index === 0 ? 6 : 4 }, (_, storyIndex) => ({ id: `story-slot-${index}-${storyIndex}`, slot: storyIndex + 1 })),
}));

const regionColors = ["primary", "accent", "primary", "accent"];

function StorySlot({ story, index, color }) {
  const accent = color === "accent";
  const visual = index % 3 === 0
    ? "radial-gradient(circle at 72% 18%, rgba(238,180,65,.18), transparent 28%), linear-gradient(145deg,#1b1810,#090b0e)"
    : index % 3 === 1
      ? "radial-gradient(circle at 22% 20%, rgba(75,180,220,.18), transparent 28%), linear-gradient(145deg,#101d24,#090b0e)"
      : "radial-gradient(circle at 70% 70%, rgba(145,103,190,.16), transparent 28%), linear-gradient(145deg,#181421,#090b0e)";
  return <article className={`group relative w-[190px] shrink-0 snap-start overflow-hidden border bg-[#0a0d11] transition-all duration-300 hover:-translate-y-1 sm:w-[220px] ${accent ? "border-accent/20 hover:border-accent/55" : "border-primary/20 hover:border-primary/55"}`}>
    <div className="relative aspect-[16/10] overflow-hidden" style={{ backgroundImage: story.cover ? `url("${story.cover}")` : visual, backgroundPosition: "center", backgroundSize: "cover" }}><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(3,5,8,.72))]" /><div className={`absolute left-3 top-3 border bg-black/50 px-2 py-1 font-mono-tech text-[0.52rem] tracking-[1.2px] ${accent ? "border-accent/30 text-accent/75" : "border-primary/30 text-primary/75"}`}>{story.type ?? `STORY_${String(story.slot ?? index + 1).padStart(2, "0")}`}</div><Archive className="absolute bottom-3 right-3 text-white/20" size={22} /></div>
    <div className="p-4"><h3 className="font-heading text-lg font-bold uppercase tracking-[1px] text-white/75">{story.title ?? "AWAITING RECORD"}</h3><div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-mono-tech text-[0.55rem] tracking-[1.3px] text-white/30"><span>{story.chapters ?? "—"} CHAPTERS</span><ChevronRight size={14} className={accent ? "text-accent/60" : "text-primary/60"} /></div></div>
  </article>;
}

function RegionRow({ region, index }) {
  const color = regionColors[index % regionColors.length];
  const accent = color === "accent";
  return <section className="relative grid gap-4 py-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-7">
    <div className="relative flex items-start gap-4 lg:pt-5"><div className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center border bg-black/25 ${accent ? "border-accent/35 text-accent" : "border-primary/35 text-primary"}`}>
    <MapPinned size={20} /></div>
    <div>
      <div className={`font-mono-tech text-[0.58rem] tracking-[1.8px] ${accent ? "text-accent/75" : "text-primary/75"}`}>STORY LINE // {region.code}
      </div><h2 className="mt-2 font-heading text-2xl font-bold uppercase tracking-[1.4px] text-white">{region.name}</h2>
      <p className="mt-2 font-mono-tech text-[0.57rem] tracking-[1.3px] text-white/35">{region.stories.length} STORY RECORDS</p>
      </div>
    </div>
      <div className="relative min-w-0">
        <div className={`pointer-events-none absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block`} /><div className="a9-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-2 pb-4 sm:gap-4">{region.stories.map((story, storyIndex) => <StorySlot key={story.id} story={story} index={storyIndex} color={color} />)}</div>
        </div>
        </section>;
}

export default function SidePath() {
  const regions = sideStoryRegions.length ? sideStoryRegions : regionSlots;
  return <main className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[#07090c] text-foreground"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_0%,rgba(224,165,53,.12),transparent_28%),radial-gradient(circle_at_12%_55%,rgba(47,151,197,.09),transparent_23%),linear-gradient(180deg,#090b0e,#06080b)]" /><div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:42px_42px]" /><div className="relative mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-10"><header className="border-b border-white/10 pb-8"><Link to="/story" className="inline-flex items-center gap-2 border border-white/15 bg-black/25 px-3 py-2 font-mono-tech text-[0.6rem] tracking-[1.5px] text-white/60 transition-colors hover:border-accent/55 hover:text-accent"><ArrowLeft size={14} /> STORY ARCHIVE</Link><div className="mt-10 font-mono-tech text-[0.64rem] tracking-[2.2px] text-accent">// TERRA_EVENT_ARCHIVE</div><div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><h1 className="font-heading text-4xl font-bold uppercase tracking-[2px] text-white sm:text-6xl">Side Stories</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Khám phá truyện theo vùng đất. Mỗi line chứa các record thuộc một region và có thể duyệt ngang độc lập.</p></div><div className="font-mono-tech text-[0.59rem] tracking-[1.5px] text-white/35">{sideStoryRegions.length} REGIONS CONNECTED</div></div></header><section className="relative mt-2 divide-y divide-white/10 before:absolute before:bottom-8 before:left-[21px] before:top-8 before:w-px before:bg-gradient-to-b before:from-primary/40 before:via-white/15 before:to-accent/40 lg:before:left-[21px]">{regions.map((region, index) => <RegionRow key={region.id} region={region} index={index} />)}</section><footer className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4 font-mono-tech text-[0.58rem] tracking-[1.4px] text-white/35"><Archive size={14} className="text-accent/70" /> REGION DATA SOURCE // PENDING CONNECTION</footer></div></main>;
}
