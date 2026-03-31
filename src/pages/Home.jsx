import { Link } from "react-router-dom";
import { User, Music, BookOpen, Database } from "lucide-react";

const sections = [
  {
    to: "/operator",
    icon: User,
    title: "Operators",
    desc: "Browse all operators, filter by class, rarity, and faction.",
  },
  {
    to: "/music",
    icon: Music,
    title: "Music",
    desc: "Listen to soundtracks from Monster Siren Records.",
  },
  {
    to: "/guide-story",
    icon: BookOpen,
    title: "Guide & Story",
    desc: "Beginner and advanced guides, plus the full story timeline.",
  },
  {
    to: "/database",
    icon: Database,
    title: "Database",
    desc: "Materials, bosses, and the material planner tool.",
  },
];

export default function Home() {
  return (
    <div className="fullpage-section px-4 py-12 bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <div className="text-center mb-16 animate-fade-in">
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-4 tracking-tight">
          ARK<span className="text-primary  ">NIGHTS</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          The unofficial fan wiki — operators, guides, music, and lore.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {sections.map((s, i) => {
          const Icon = s.icon;

          return (
            <Link
              key={s.to}
              to={s.to}
              className="ark-card p-6 flex flex-col items-center text-center group "
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="text-primary" size={28} />
              </div>

              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                {s.title}
              </h2>

              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
