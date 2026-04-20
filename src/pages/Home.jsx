import { Link } from "react-router-dom";
import { User, Music, BookOpen, Database } from "lucide-react";

const tickerItems = [
  { text: "// WELCOME COMMANDER ▸" },
  { text: "OPERATOR DATABASE", hi: "ONLINE" },
  { text: "// RHODES ISLAND INTEL SYSTEM" },
  { text: "TOTAL OPERATORS:", hi: "250+" },
  { text: "// NEW EVENT: CHAPTER 13 UNLOCKED" },
  { text: "THREAT LEVEL:", hi: "CONTINGENCY" },
  { text: "// COMMANDER ACCESS GRANTED" },
];

const modules = [
  {
    icon: "⚔️",
    title: "OPERATORS",
    desc: "Hồ sơ đầy đủ, số liệu thống kê, kỹ năng, và lời thoại của operators trong danh sách.",
    count: "250+ RECORDS",
    to: "/operator",
  },
  {
    icon: "💀",
    title: "ENEMIES",
    desc: "Thông tin về kẻ thù, bosses và đơn vị tinh nhuệ. Kháng chiến, khả năng và dữ liệu.",
    count: "180+ TARGETS",
    to: "/database/bosses",
  },
  {
    icon: "🎵",
    title: "MUSIC",
    desc: "Lưu trữ BGM trên tất cả các chương, sự kiện và chủ đề của nhà điều hành. Danh sách theo dõi đầy đủ",
    count: "400+ TRACKS",
    to: "/music",
  },
  {
    icon: "📖",
    title: "STORY",
    desc: "Tóm tắt các chương, truyền thuyết sự kiện, cốt truyện nhân vật và các kỷ lục xây dựng thế giới.",
    count: "13 CHAPTERS",
    to: "/guide-story",
  },
  {
    icon: "🗺️",
    title: "MATERIALS",
    desc: "Các nguyên liệu Tier 1–5, map farm và lập kế hoạch thăng cấp operators.",
    count: "150+ ITEMS",
    to: "/database/materials",
  },
  {
    icon: "📡",
    title: "DATABASE",
    desc: "Chỉ mục trung tâm — bosses, tài liệu, công cụ lập kế hoạch và tham khảo..",
    count: "LIVE UPDATES",
    to: "/database",
  },
];
export default function Home() {
  return (
    <div className="relative">
      {/* TICKER */}
      <div className="relative z-[2] border-y border-primary/20 bg-background/90 py-2.5 overflow-hidden">
        <div className="flex gap-12 animate-ticker whitespace-nowrap">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((t, i) => (
            <span
              key={i}
              className="font-mono-tech text-[0.65rem] text-muted-foreground tracking-wider flex-shrink-0"
            >
              {t.text} {t.hi && <span className="text-primary">{t.hi}</span>}
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="relative z-[2] min-h-[calc(100vh-4rem)] flex items-center overflow-hidden py-12">
        {/* glows */}
        <div className="absolute -top-24 -right-24 w-[600px] h-[600px] rounded-full blur-[80px] pointer-events-none bg-primary/10" />
        <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full blur-[80px] pointer-events-none bg-primary/5" />
        <div className="absolute top-[30%] left-[40%] w-[300px] h-[300px] rounded-full blur-[80px] pointer-events-none bg-accent/5" />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <div className="animate-fade-in">
            <div className="font-mono-tech text-[0.7rem] text-primary tracking-[3px] mb-5 flex items-center gap-2">
              <span className="w-6 h-px bg-primary" />
              RHODES ISLAND DATABASE — A9VN
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold leading-none tracking-wider mb-2">
              <span className="block text-foreground">DOCTER,</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, hsl(var(--primary)), hsl(35 90% 55%))",
                }}
              >
                ACCESS GRANTED
              </span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md mt-5 mb-9 border-l-2 border-primary/20 pl-4">
              Thiết bị đầu cuối tình báo của bạn cho Arknights. Duyệt hồ sơ
              người điều hành, thông tin về kẻ thù, kho lưu trữ nhạc và bản ghi
              câu chuyện — tất cả trong một cơ sở dữ liệu bảo mật.
            </p>
            <div className="flex gap-4 items-center flex-wrap">
              <Link
                to="/database"
                className="font-heading font-bold text-sm tracking-[3px] uppercase px-8 py-3.5 text-primary-foreground transition-transform hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(90deg, hsl(var(--primary)), hsl(35 90% 55%))",
                  clipPath:
                    "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                }}
              >
                Truy cập Database
              </Link>
              <Link
                to="/operator"
                className="font-heading font-semibold text-sm tracking-[2px] uppercase px-7 py-3 bg-transparent border border-primary/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                Xem Operators
              </Link>
            </div>

            <div className="flex gap-8 mt-10 pt-8 border-t border-primary/20 flex-wrap">
              {[
                { num: "250", suffix: "+", label: "OPERATORS" },
                { num: "180", suffix: "+", label: "ENEMIES" },
                { num: "400", suffix: "+", label: "BGM TRACKS" },
                { num: "13", suffix: "", label: "CHAPTERS" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="font-heading text-3xl font-bold text-foreground leading-none">
                    {s.num}
                    <span className="text-primary">{s.suffix}</span>
                  </span>
                  <span className="font-mono-tech text-[0.65rem] text-muted-foreground tracking-[2px]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — operator terminal */}
          {/* <div
            className="relative flex justify-center animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <OperatorShowcaseWidget />
          </div> */}
        </div>
      </section>

      {/* MODULES */}
      <section className="relative z-[2] max-w-[1400px] mx-auto px-6 md:px-10 py-20">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono-tech text-[0.7rem] text-primary tracking-[3px]">
            // NAVIGATION_MODULES
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent" />
          <span className="font-mono-tech text-[0.65rem] text-muted-foreground">
            06 MODULES
          </span>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[2px]">
          {modules.map((m) => (
            <Link
              key={m.title}
              to={m.to}
              className="group relative bg-card/85 border border-primary/20 px-6 py-7 flex flex-col gap-3 overflow-hidden transition-all hover:border-primary/50 hover:-translate-y-1"
            >
              <span className="absolute top-0 left-0 w-[2px] h-full bg-primary scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform" />
              <div className="w-10 h-10 border border-primary/20 flex items-center justify-center text-lg bg-primary/5">
                {m.icon}
              </div>
              <div className="font-heading text-lg font-bold text-foreground tracking-wide">
                {m.title}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {m.desc}
              </div>
              <div className="font-mono-tech text-[0.65rem] text-primary mt-auto">
                {m.count}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
