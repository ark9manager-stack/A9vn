import { useParams, Link } from "react-router-dom";
import { bosses, getEnemyAvatarUrl } from "../data/enemies/enemies";
import { ArrowLeft, Zap } from "lucide-react";

export default function BossDetail() {
  const { id } = useParams();
  const boss = bosses.find((b) => b.id === id);

  if (!boss) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Boss not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl pt-14">
      <Link
        to="/database/bosses"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Bosses
      </Link>

      <div className="ark-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
            <img
              src={getEnemyAvatarUrl(boss.id)}
              alt={boss.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target;
                img.style.display = "none";
                if (img.parentElement) {
                  img.parentElement.innerHTML = `<span class="text-4xl">👹</span>`;
                }
              }}
            />
          </div>

          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {boss.name}
            </h1>

            <p className="text-sm text-muted-foreground">Index: {boss.index}</p>

            <div className="flex gap-2 mt-1">
              {boss.damageType.map((dt) => (
                <span
                  key={dt}
                  className={`text-xs px-2 py-0.5 rounded font-medium ${
                    dt === "PHYSIC"
                      ? "bg-amber-400/10 text-amber-400"
                      : "bg-blue-400/10 text-blue-400"
                  }`}
                >
                  {dt === "PHYSIC" ? "Physical" : dt === "MAGIC" ? "Arts" : dt}
                </span>
              ))}
            </div>
          </div>
        </div>

        {boss.description && (
          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
            {boss.description}
          </p>
        )}
      </div>

      {boss.abilities.length > 0 && (
        <div className="ark-card p-6">
          <h2 className="font-heading text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap size={18} className="text-accent" /> Abilities
          </h2>

          <div className="space-y-3">
            {boss.abilities.map((ability, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {i + 1}
                </span>

                <p className="text-muted-foreground">{ability}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
