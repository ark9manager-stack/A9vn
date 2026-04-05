import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { bosses, getEnemyAvatarUrl } from "../data/enemies/enemies";
import CardBase from "../components/CardBase";
import FilterBar from "../components/UI/FilterBar";

export default function BossesPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const damageTypes = [...new Set(bosses.flatMap((b) => b.damageType))];

  const filtered = useMemo(() => {
    return bosses.filter((b) => {
      if (search && !b.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (
        filters["Damage Type"] &&
        !b.damageType.includes(filters["Damage Type"])
      )
        return false;
      return true;
    });
  }, [search, filters]);

  return (
    <div className="container mx-auto px-4 py-8 pt-14">
      <h1 className="font-heading text-4xl font-bold text-foreground mb-6">
        Boss Encyclopedia
      </h1>

      <p className="text-muted-foreground mb-6">
        {bosses.length} bosses found in the database
      </p>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search bosses..."
        filters={[{ label: "Damage Type", options: damageTypes }]}
        activeFilters={filters}
        onFilterChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map((boss) => (
          <Link key={boss.id} to={`/database/bosses/${boss.id}`}>
            <CardBase className="p-4 text-center group">
              <div className="w-16 h-16 mx-auto mb-2 rounded-lg overflow-hidden bg-secondary flex items-center justify-center">
                <img
                  src={getEnemyAvatarUrl(boss.id)}
                  alt={boss.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  onError={(e) => {
                    const img = e.target;
                    img.style.display = "none";
                    if (img.parentElement) {
                      img.parentElement.innerHTML = `<span class="text-2xl">👹</span>`;
                    }
                  }}
                />
              </div>

              <h3 className="font-heading text-sm font-bold text-foreground truncate">
                {boss.name}
              </h3>

              <div className="flex gap-1 justify-center mt-1">
                {boss.damageType.map((dt) => (
                  <span
                    key={dt}
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      dt === "PHYSIC"
                        ? "bg-amber-400/10 text-amber-400"
                        : "bg-blue-400/10 text-blue-400"
                    }`}
                  >
                    {dt === "PHYSIC"
                      ? "Physical"
                      : dt === "MAGIC"
                        ? "Arts"
                        : dt}
                  </span>
                ))}
              </div>
            </CardBase>
          </Link>
        ))}
      </div>
    </div>
  );
}
