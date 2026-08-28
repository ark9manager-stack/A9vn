import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { bosses, getEnemyAvatarUrl } from "../data/enemies/enemies";
import CardBase from "../components/CardBase";
import FilterBar from "../components/UI/FilterBar";
import BossDetail from "./BossDetail";
import { resetScrollLock } from "../hooks/useScrollLock";

function decodeRouteId(value) {
  if (!value) return "";
  try { return decodeURIComponent(String(value)); } catch { return String(value); }
}

export default function BossesPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const savedScrollRef = useRef(0);
  const navigate = useNavigate();
  const { id } = useParams();

  const damageTypes = useMemo(() => [...new Set(bosses.flatMap((boss) => boss.damageType))], []);
  const filtered = useMemo(() => bosses.filter((boss) => {
    if (search && !boss.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters["Damage Type"] && !boss.damageType.includes(filters["Damage Type"])) return false;
    return true;
  }), [search, filters]);
  const selectedBoss = useMemo(() => {
    const routeId = decodeRouteId(id);
    return routeId ? bosses.find((boss) => boss.id === routeId) || null : null;
  }, [id]);

  const openBoss = (boss) => {
    savedScrollRef.current = window.scrollY || 0;
    navigate(`/database/bosses/${encodeURIComponent(boss.id)}`);
  };
  const closeBoss = () => {
    resetScrollLock();
    navigate("/database/bosses", { replace: true });
    window.requestAnimationFrame(() => window.scrollTo({ top: savedScrollRef.current, left: 0, behavior: "auto" }));
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-8">
      <h1 className="mb-6 font-heading text-4xl font-bold text-foreground">Boss Encyclopedia</h1>
      <p className="mb-6 text-muted-foreground">{bosses.length} bosses found in the database</p>
      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search bosses..." filters={[{ label: "Damage Type", options: damageTypes }]} activeFilters={filters} onFilterChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map((boss) => (
          <button key={boss.id} type="button" onClick={() => openBoss(boss)} className="text-left">
            <CardBase className="group h-full p-4 text-center">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                <img src={getEnemyAvatarUrl(boss.id)} alt={boss.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              </div>
              <h3 className="truncate font-heading text-sm font-bold text-foreground">{boss.name}</h3>
              <div className="mt-1 flex justify-center gap-1">
                {boss.damageType.map((type) => <span key={type} className={`rounded px-1.5 py-0.5 text-xs ${type === "PHYSIC" ? "bg-amber-400/10 text-amber-400" : "bg-blue-400/10 text-blue-400"}`}>{type === "PHYSIC" ? "Physical" : type === "MAGIC" ? "Arts" : type}</span>)}
              </div>
            </CardBase>
          </button>
        ))}
      </div>

      {id && !selectedBoss && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"><div className="rounded-xl border border-white/10 bg-[#151a20] p-8 text-center shadow-2xl"><p className="mb-4 text-muted-foreground">Boss not found.</p><button type="button" onClick={closeBoss} className="text-cyan-400 hover:text-cyan-300">Back to Bosses</button></div></div>}
      <BossDetail boss={selectedBoss} onClose={closeBoss} />
    </div>
  );
}
