// src/hooks/useOperators.js
import { useEffect, useState } from "react";
import operators from "../data/operators/character_table.json";
import nameVN from "../data/operators/name_vn.json";

export function useOperators() {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const parsed = Object.entries(operators)
      .filter(([id]) => id !== "char_512_aprot")
      .filter(([, op]) => op.profession !== "TOKEN")
      .map(([id, op]) => ({
        id,
        name: nameVN?.[id]?.name_vn || op.name,
        nameRaw: op.name,
        idweb: nameVN?.[id]?.idweb ?? null,
        sortIndex: op.sortIndex ?? 0,
        rarity: op.rarity,
        profession: op.profession,
        subProfession: op.subProfessionId,
        position: op.position,
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
