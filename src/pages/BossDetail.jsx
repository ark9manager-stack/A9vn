import { useEffect } from "react";
import { Shield, X, Zap } from "lucide-react";
import { getEnemyAvatarUrl } from "../data/enemies/enemies";
import { useScrollLock } from "../hooks/useScrollLock";

const statRows = [
  [["HP", "hp"], ["ATK", "atk"], ["DEF", "def"], ["RES", "res"]],
  [["Movement Speed", "movementSpeed"], ["Attack Interval", "attackInterval"], ["Elemental RES", "elementalResistance"], ["Effect Resistance", "effectResistance"]],
  [["Attack Range", "attackRange"], ["HP Regeneration", "hpRegeneration"], ["Weight", "weight"], ["Aggression Level", "aggressionLevel"]],
];

const Cell = ({ label, value, className = "" }) => (
  <div className={`border-b border-r border-white/10 px-3 py-3 text-center last:border-r-0 ${className}`}>
    <div className="mb-1 text-[11px] font-bold uppercase tracking-[.13em] text-white/45">{label}</div>
    <span className="block min-h-5 text-sm font-semibold text-white">{value ?? ""}</span>
  </div>
);

function Stats({ boss }) {
  const stats = boss.stats || {};
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#151a20] shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Shield size={18} className="text-cyan-400" />
        <h2 className="font-heading text-xl font-semibold text-white">Stats</h2>
      </div>
      <div className="overflow-x-auto"><div className="min-w-0">
        {statRows.map((row, i) => <div key={i} className="grid grid-cols-4">{row.map(([label, key]) => <Cell key={key} label={label} value={stats[key]} />)}</div>)}
        <div className="grid grid-cols-[1fr_3fr]">
          <Cell label="Life Point Penalty" value={stats.lifePointPenalty} className="border-b-0" />
          <Cell label="Effect Susceptibilities" value={stats.effectSusceptibilities} className="border-b-0" />
        </div>
      </div></div>
    </section>
  );
}

function Abilities({ boss }) {
  const rows = boss.abilities?.length ? boss.abilities : [null];
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#151a20] shadow-xl">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
        <Zap size={18} className="text-amber-400" />
        <h2 className="font-heading text-xl font-semibold text-white">Abilities</h2>
      </div>
      <div className="overflow-x-auto"><table className="w-full table-fixed border-collapse text-left">
        <colgroup><col className="w-[70%]" /><col className="w-[15%]" /><col className="w-[15%]" /></colgroup>
        <thead><tr className="bg-white/[.04] text-[11px] uppercase tracking-[.13em] text-white/45">
          <th className="border-b border-r border-white/10 px-4 py-3">Ability</th>
          <th className="border-b border-r border-white/10 px-3 py-3 text-center">Initial CD</th>
          <th className="border-b border-white/10 px-3 py-3 text-center">Cooldown</th>
        </tr></thead>
        <tbody>{rows.map((ability, i) => {
          const item = typeof ability === "string" ? { description: ability } : ability || {};
          return <tr key={item.id || i} className="align-top text-sm text-white/70">
            <td className="h-14 border-b border-r border-white/10 px-4 py-3 leading-relaxed">{item.name && <div className="mb-1 font-semibold text-white">{item.name}</div>}{item.description || ""}</td>
            <td className="border-b border-r border-white/10 px-3 py-3 text-center text-lime-400">{item.initialCooldown ?? ""}</td>
            <td className="border-b border-white/10 px-3 py-3 text-center text-lime-400">{item.cooldown ?? ""}</td>
          </tr>;
        })}</tbody>
      </table></div>
    </section>
  );
}

export default function BossDetail({ boss, onClose }) {
  useScrollLock(Boolean(boss));
  useEffect(() => {
    if (!boss) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && onClose?.();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [boss, onClose]);
  if (!boss) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm md:p-5" role="dialog" aria-modal="true" aria-labelledby="boss-detail-title">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close boss details" />
      <div className="relative flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-[#0d1116] shadow-2xl md:h-[92vh] md:rounded-2xl md:border md:border-white/10">
        <header className="flex shrink-0 items-center gap-4 border-b border-white/10 bg-[#11161c] px-4 py-3 sm:px-6">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-white/5 sm:h-20 sm:w-20"><img src={getEnemyAvatarUrl(boss.id)} alt={boss.name} className="h-full w-full object-cover" /></div>
          <div className="min-w-0 flex-1"><h1 id="boss-detail-title" className="truncate font-heading text-xl font-bold text-white sm:text-3xl">{boss.name}</h1><p className="mt-1 text-xs uppercase tracking-[.18em] text-cyan-400/80">Index {boss.index}</p></div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-white/60 transition hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-white" aria-label="Close boss details"><X size={22} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6"><div className="space-y-5">
          {boss.description && <p className="max-w-4xl text-sm leading-6 text-white/55">{boss.description}</p>}
          <Stats boss={boss} /><Abilities boss={boss} />
        </div></div>
      </div>
    </div>
  );
}
