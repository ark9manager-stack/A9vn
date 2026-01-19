// src/hooks/useOperatorFilter.js
import { useMemo } from "react";
import {
  getRarityTier,
  rarityRank,
  getIdWebNumber,
  subProfIconUrl,
  subProfLabel,
} from "../utils/operatorUtils";

export function useOperatorFilter({ operators, activeClass, activeSubClass }) {
  const availableSubclasses = useMemo(() => {
    if (!activeClass) return [];

    const set = new Set();

    operators.forEach((op) => {
      if (op.profession === "TRAP" || op.profession === "TOKEN") return;
      if (op.profession !== activeClass) return;
      if (op.subProfession) set.add(op.subProfession);
    });

    return Array.from(set)
      .map((id) => ({
        id,
        icon: subProfIconUrl(id),
        label: subProfLabel(id),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [operators, activeClass]);

  const filteredOperators = useMemo(() => {
    return operators
      .filter((op) => !["TRAP", "TOKEN"].includes(op.profession))
      .filter((op) => (activeClass ? op.profession === activeClass : true))
      .filter((op) =>
        activeSubClass ? op.subProfession === activeSubClass : true,
      )
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
  }, [operators, activeClass, activeSubClass]);

  return { availableSubclasses, filteredOperators };
}
