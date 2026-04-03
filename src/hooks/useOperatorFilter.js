import { useMemo } from "react";
import {
  getRarityTier,
  rarityRank,
  getIdWebNumber,
  subProfIconUrl,
  subProfLabel,
} from "../utils/operatorUtils";

export function useOperatorFilter({
  operators,
  activeClass,
  activeSubClass,
  tags,
  position,
  search,
}) {
  const activeClasses = useMemo(
    () =>
      Array.isArray(activeClass)
        ? activeClass
        : activeClass
          ? [activeClass]
          : [],
    [activeClass],
  );

  const activeSubclasses = useMemo(
    () =>
      Array.isArray(activeSubClass)
        ? activeSubClass
        : activeSubClass
          ? [activeSubClass]
          : [],
    [activeSubClass],
  );

  const activePositions = useMemo(
    () => (Array.isArray(position) ? position : position ? [position] : []),
    [position],
  );

  const availableSubclasses = useMemo(() => {
    if (activeClasses.length === 0) return [];

    const set = new Set();

    operators.forEach((op) => {
      if (op.profession === "TRAP" || op.profession === "TOKEN") return;
      if (!activeClasses.includes(op.profession)) return;
      if (op.subProfession) set.add(op.subProfession);
    });

    return Array.from(set)
      .map((id) => ({
        id,
        icon: subProfIconUrl(id),
        label: subProfLabel(id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [operators, activeClasses]);

  const searchTerm = search?.trim().toLowerCase();

  const filteredOperators = useMemo(() => {
    return operators
      .filter((op) => !["TRAP", "TOKEN"].includes(op.profession))
      .filter((op) =>
        activeClasses.length > 0 ? activeClasses.includes(op.profession) : true,
      )
      .filter((op) =>
        activeSubclasses.length > 0
          ? activeSubclasses.includes(op.subProfession)
          : true,
      )
      .filter((op) => {
        if (!Array.isArray(tags) || tags.length === 0) return true;
        const opTags = Array.isArray(op.tagList) ? op.tagList : [];
        return tags.some((t) => opTags.includes(t));
      })
      .filter((op) =>
        activePositions.length > 0
          ? activePositions.includes(op.position)
          : true,
      )
      .filter((op) => {
        if (!searchTerm) return true;
        const nameMatch = String(op.name || "")
          .toLowerCase()
          .includes(searchTerm);
        const rawNameMatch = String(op.nameRaw || "")
          .toLowerCase()
          .includes(searchTerm);
        const idMatch = String(op.id || "")
          .toLowerCase()
          .includes(searchTerm);
        return nameMatch || rawNameMatch || idMatch;
      })
      .sort((a, b) => {
        const ra = rarityRank(getRarityTier(a.rarity));
        const rb = rarityRank(getRarityTier(b.rarity));
        if (ra !== rb) return ra - rb;

        const ia = getIdWebNumber(a);
        const ib = getIdWebNumber(b);
        if (ia != null && ib != null && ia !== ib) return ib - ia;
        if (ia != null) return -1;
        if (ib != null) return 1;

        return String(a.name).localeCompare(String(b.name));
      });
  }, [
    operators,
    activeClasses,
    activeSubclasses,
    activePositions,
    tags,
    searchTerm,
  ]);

  return { availableSubclasses, filteredOperators };
}
