import { cn } from "../../utils/cn";

export default function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-6">
      {onSearchChange && (
        <input
          type="text"
          value={searchValue || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder || "Search..."}
          className={cn(
            "bg-secondary border border-border rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-64",
          )}
        />
      )}

      {filters.map((filter) => (
        <select
          key={filter.label}
          value={activeFilters[filter.label] || ""}
          onChange={(e) => onFilterChange(filter.label, e.target.value)}
          className={cn(
            "bg-secondary border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary",
          )}
        >
          <option value="">{filter.label}</option>

          {filter.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
