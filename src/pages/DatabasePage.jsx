import React from "react";
import { Link } from "react-router-dom";
import { Package, Skull, Calculator } from "lucide-react";

const sections = [
  {
    to: "/database/materials",
    icon: Package,
    title: "Materials",
    desc: "Browse all upgrade materials and farming locations.",
  },
  {
    to: "/database/bosses",
    icon: Skull,
    title: "Bosses",
    desc: "Enemy boss database with stats and mechanics.",
  },
  {
    to: "/database/planner",
    icon: Calculator,
    title: "Material Planner",
    desc: "Plan your operator upgrades and material farming.",
  },
];

const DatabasePage = () => {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">
          Database
        </h1>

        <div className="grid sm:grid-cols-3 gap-6">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group p-8 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-all"
            >
              <s.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h2 className="text-foreground text-xl font-semibold mb-2">
                {s.title}
              </h2>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;
