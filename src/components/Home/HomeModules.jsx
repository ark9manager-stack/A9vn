import { Link } from "react-router-dom";
import { BookOpen, Database, Disc3, Map, Skull, Swords } from "lucide-react";

import bgDark from "../../assets/enm.webp";
import bgWhite from "../../assets/story.webp";
import bgInform from "../../assets/op.webp";
import entryAnimBg from "../../assets/AS2026.webp";
import eliteTwo from "../../assets/assets_op/elite_2_large.png";
import opDefault from "../../assets/assets_op/default.png";

const modules = [
  {
    icon: Swords,
    code: "OPR",
    title: "OPERATORS",
    desc: "Hồ sơ, chỉ số, kỹ năng, module và lời thoại của operators.",
    count: "250+ RECORDS",
    to: "/operator",
    image: bgInform,
    imageClass: "object-cover object-center",
  },
  {
    icon: Skull,
    code: "ENM",
    title: "ENEMIES",
    desc: "Dữ liệu kẻ thù, boss, kháng tính, kỹ năng và threat level.",
    count: "180+ TARGETS",
    to: "/database/bosses",
    image: bgDark,
    imageClass: "object-cover object-center",
  },
  {
    icon: Disc3,
    code: "BGM",
    title: "MUSIC",
    desc: "Kho BGM theo chương, sự kiện và các track chủ đề.",
    count: "400+ TRACKS",
    to: "/music",
    image: entryAnimBg,
    imageClass: "object-cover object-center",
  },
  {
    icon: BookOpen,
    code: "STY",
    title: "STORY",
    desc: "Tóm tắt chương, event lore, hồ sơ nhân vật và worldbuilding.",
    count: "13 CHAPTERS",
    to: "/guide-story",
    image: bgWhite,
    imageClass: "object-cover object-center",
  },
  {
    icon: Map,
    code: "MAT",
    title: "MATERIALS",
    desc: "Nguyên liệu Tier 1–5, map farm và kế hoạch nâng cấp.",
    count: "150+ ITEMS",
    to: "/database/materials",
    image: eliteTwo,
    imageClass: "object-contain object-center p-8",
  },
  {
    icon: Database,
    code: "DB",
    title: "DATABASE",
    desc: "Chỉ mục trung tâm cho dữ liệu, tài liệu, tools và tham khảo.",
    count: "LIVE UPDATES",
    to: "/database",
    image: opDefault,
    imageClass: "object-contain object-center p-7",
  },
];

export default function HomeModules() {
  return (
    <section className="relative z-[2] max-w-[1400px] mx-auto px-6 md:px-10 py-20">
      <div className="mb-12 flex items-center gap-4">
        <span className="font-mono-tech text-[0.7rem] text-primary tracking-[3px]">
          // NAVIGATION_MODULES
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-primary/25 via-white/10 to-transparent" />
        <span className="font-mono-tech text-[0.65rem] text-muted-foreground">
          06 MODULES
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module, index) => {
          const Icon = module.icon;

          return (
            <Link
              key={module.title}
              to={module.to}
              aria-label={`Open ${module.title}`}
              className="group/module relative min-h-[360px] overflow-hidden border border-white/10 bg-[#06080b] transition-all duration-300 hover:-translate-y-1 hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))",
              }}
            >
              {/* steel/noise base */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.10),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(255,255,255,0.06),transparent_32%),linear-gradient(145deg,#06080b_0%,#111821_38%,#070a0e_100%)]" />
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0px,rgba(255,255,255,0.035)_1px,transparent_1px,transparent_12px)]" />
              <span className="absolute left-0 top-0 h-full w-[3px] origin-bottom scale-y-0 bg-white/55 transition-transform duration-300 group-hover/module:scale-y-100" />

              <div className="relative z-[1] flex h-full flex-col p-5">
                {/* Image preview: dark normally, bright on hover */}
                <div className="relative mb-5 h-[150px] overflow-hidden border border-white/10 bg-black/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <img
                    src={module.image}
                    alt=""
                    className={`absolute inset-0 h-full w-full select-none transition-all duration-500 ease-out ${module.imageClass} opacity-45 brightness-[0.38] contrast-125 grayscale-[0.45] saturate-[0.55] scale-[1.02] group-hover/module:opacity-95 group-hover/module:brightness-100 group-hover/module:contrast-110 group-hover/module:grayscale-0 group-hover/module:saturate-100 group-hover/module:scale-105`}
                    draggable={false}
                  />

                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-black/70 transition-opacity duration-500 group-hover/module:opacity-55" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(0,0,0,0.38)_72%)] transition-opacity duration-500 group-hover/module:opacity-35" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-50" />

                  <div className="absolute left-3 top-3 font-mono-tech text-[0.62rem] tracking-[2px] text-white/45 transition-colors duration-300 group-hover/module:text-white/75">
                    MODULE_{String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="absolute right-3 top-3 border border-white/10 bg-black/45 px-2 py-1 font-mono-tech text-[0.58rem] tracking-[2px] text-white/55 backdrop-blur-sm transition-colors duration-300 group-hover/module:text-white/85">
                    {module.code}
                  </div>

                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="h-[6px] w-[42px] bg-white/25 transition-colors duration-300 group-hover/module:bg-white/65" />
                    <div className="h-[6px] w-[18px] bg-white/15 transition-colors duration-300 group-hover/module:bg-white/35" />
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/10 bg-white/[0.04] text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-300 group-hover/module:border-white/25 group-hover/module:bg-white/[0.08] group-hover/module:text-white">
                    <Icon size={19} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="font-heading text-xl font-bold tracking-[1.5px] text-foreground transition-colors duration-300 group-hover/module:text-white">
                      {module.title}
                    </div>
                    <div className="font-mono-tech text-[0.62rem] tracking-[2px] text-white/35 transition-colors duration-300 group-hover/module:text-white/55">
                      SECURE FILE NODE
                    </div>
                  </div>
                </div>

                <p className="min-h-[66px] text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover/module:text-white/70">
                  {module.desc}
                </p>

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="font-mono-tech text-[0.65rem] tracking-[1.5px] text-white/45 transition-colors duration-300 group-hover/module:text-white/70">
                    {module.count}
                  </div>
                  <div className="font-mono-tech text-[0.62rem] font-bold uppercase tracking-[2px] text-white/35 transition-colors duration-300 group-hover/module:text-white/85">
                    CLICK TO ACCESS ▸
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
