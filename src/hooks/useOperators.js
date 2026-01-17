// src/hooks/useOperators.js
import { useEffect, useState } from "react";
import operators from "../data/operators/character_table.json";

export function useOperators() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const parsed = Object.entries(operators)
      .filter(([id]) => id !== "char_512_aprot")
      .filter(([id, op]) => op.profession !== "TOKEN")
      .map(([id, op]) => ({
        id,
        name: op.name,
        rarity: op.rarity,
        profession: op.profession,
        subProfession: op.subProfessionId,
        description: op.description,
        phases: op.phases,
        skills: op.skills,
        talents: op.talents,
        stats: op.phases?.[0]?.attributesKeyFrames?.[0]?.data,
      }));

    setList(parsed);
  }, []);

  return {
    operators: list,
    selectedOperator: selected,
    setSelectedOperator: setSelected,
  };
}
