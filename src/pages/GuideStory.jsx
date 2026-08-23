import { useRef } from "react";
import { Link } from "react-router-dom";
import { Archive, BookOpen, ChevronRight, Layers3, Sparkles } from "lucide-react";

const archiveTypes = [
  { id: "main", title: "MAIN STORY", label: "RHODES ISLAND RECORDS", description: "Theo dõi tuyến truyện trung tâm của Rhodes Island theo từng chương.", icon: BookOpen, accent: "primary" },
  { id: "side", title: "SIDE STORIES", label: "TERRA EVENT ARCHIVE", description: "Khám phá các sự kiện, vùng đất và những mảnh truyện bên ngoài tuyến chính.", icon: Archive, accent: "accent" },
];

function ArchiveChoice({ item }) {
  const Icon = item.icon;
  const side = item.accent === "accent";
  const accentClass = side ? "border-accent/25 hover:border-accent/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.32),0_0_32px_hsl(var(--accent)/0.11)]" : "border-primary/25 hover:border-primary/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.32),0_0_32px_hsl(var(--primary)/0.11)]";
  const color = side ? "text-accent" : "text-primary";
  return <Link to={item.id === "main" ? "/mainpath" : "/sidepath"} className={`group relative min-h-[330px] overflow-hidden border bg-[#080b0f]/85 p-6 text-left transition-all duration-300 hover:-translate-y-1 sm:p-8 ${accentClass}`} style={{ clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))" }}>
    <div className={`absolute inset-0 opacity-70 ${side ? "bg-[radial-gradient(circle_at_85%_10%,rgba(255,184,70,0.18),transparent_28%),linear-gradient(145deg,#090b0e_0%,#201c14_52%,#080a0d_100%)]" : "bg-[radial-gradient(circle_at_16%_10%,rgba(117,224,255,0.17),transparent_28%),linear-gradient(145deg,#080b0f_0%,#16232c_52%,#080a0d_100%)]"}`} />
    <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_12px)]" />
    <div className="relative flex h-full flex-col"><div className="flex items-start justify-between"><div className={`flex h-14 w-14 items-center justify-center border bg-black/20 ${side ? "border-accent/35 text-accent" : "border-primary/35 text-primary"}`}><Icon size={28} /></div><span className="font-mono-tech text-[0.6rem] tracking-[2px] text-white/35">{item.id === "main" ? "CHANNEL_01" : "CHANNEL_02"}</span></div><div className={`mt-12 font-mono-tech text-[0.62rem] tracking-[2px] ${color}`}>{item.label}</div><h2 className="mt-2 font-heading text-3xl font-bold uppercase tracking-[1.5px] text-white sm:text-4xl">{item.title}</h2><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5 font-mono-tech text-[0.64rem] tracking-[1.6px] text-white/50 transition-colors group-hover:text-white/85"><span>OPEN ARCHIVE</span><ChevronRight size={18} className={`${color} transition-transform group-hover:translate-x-1`} /></div></div>
  </Link>;
}

export default function GuideStory() {
  const archiveRef = useRef(null);
  const enterArchive = () => archiveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  return <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
    <section className="relative border-b border-white/10 px-4 py-20 sm:px-6 sm:py-24 lg:px-10"><div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.022)_1px,transparent_1px)] [background-size:48px_48px]" /><div className="relative mx-auto max-w-[1400px] text-center"><h1 className="font-heading text-5xl font-bold uppercase tracking-[3px] text-white sm:text-7xl">Story <span className="text-primary [text-shadow:0_0_26px_hsl(var(--primary)/0.5)]">Archive</span></h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Kho lưu trữ câu chuyện của Terra. Dữ liệu chương truyện và sự kiện sẽ được kết nối từ nguồn nội dung của bạn.</p><button type="button" onClick={enterArchive} className="mt-9 inline-flex items-center gap-2 border border-primary/45 bg-primary px-6 py-3 font-heading text-sm font-bold uppercase tracking-[1.8px] text-primary-foreground transition-transform hover:-translate-y-0.5"><span>Enter archive</span><ChevronRight size={17} /></button></div></section>
    <div ref={archiveRef} className="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"><section className="animate-in"><header className="mb-7 border-b border-white/10 pb-6"><div className="mb-2 font-mono-tech text-[0.64rem] tracking-[2px] text-primary">// ARCHIVE_CATEGORIES</div><h2 className="font-heading text-3xl font-bold uppercase tracking-[2px] text-white sm:text-4xl">Choose your path</h2><p className="mt-3 text-sm text-muted-foreground">Chọn kho truyện để duyệt nội dung khi nguồn dữ liệu sẵn sàng.</p></header><div className="grid gap-5 md:grid-cols-2">{archiveTypes.map((item) => <ArchiveChoice key={item.id} item={item} />)}</div></section><footer className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4 font-mono-tech text-[0.6rem] tracking-[1.5px] text-white/35"><Layers3 size={14} className="text-primary/70" /> DATA SOURCE // PENDING CONNECTION</footer></div>
  </div>;
}
