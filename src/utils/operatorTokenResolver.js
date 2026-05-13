function normalizeTokenId(value) {
  const id = String(value || "").trim();
  return id.startsWith("token_") ? id : "";
}

function pushUniqueToken(list, seen, tokenId, meta = {}) {
  const id = normalizeTokenId(tokenId);
  if (!id || seen.has(id)) return;
  seen.add(id);
  list.push({ tokenId: id, ...meta });
}

export function collectOperatorTokenOptions(charData) {
  if (!charData || typeof charData !== "object") return [];

  const out = [];
  const seen = new Set();

  const skills = Array.isArray(charData?.skills) ? charData.skills : [];
  skills.forEach((skill, idx) => {
    pushUniqueToken(out, seen, skill?.overrideTokenKey, {
      source: "skill",
      skillIndex: idx + 1,
    });
  });

  const tokenDict = charData?.displayTokenDict;
  if (tokenDict && typeof tokenDict === "object") {
    Object.keys(tokenDict).forEach((tokenId) => {
      pushUniqueToken(out, seen, tokenId, {
        source: "displayTokenDict",
        skillIndex: null,
      });
    });
  }

  const talents = Array.isArray(charData?.talents) ? charData.talents : [];
  talents.forEach((talent, talentIdx) => {
    const candidates = Array.isArray(talent?.candidates)
      ? talent.candidates
      : [];
    candidates.forEach((candidate) => {
      pushUniqueToken(out, seen, candidate?.tokenKey, {
        source: "talent",
        talentIndex: talentIdx + 1,
        skillIndex: null,
      });
    });
  });

  return out;
}

export function resolveTokenForSkill(charData, selectedSkillRef, selectedSkillIndex = 0) {
  if (!charData || typeof charData !== "object") return null;

  const direct = normalizeTokenId(selectedSkillRef?.overrideTokenKey);
  if (direct) {
    return {
      tokenId: direct,
      source: "skill",
      skillIndex: Number(selectedSkillIndex || 0) + 1,
    };
  }

  const skills = Array.isArray(charData?.skills) ? charData.skills : [];
  const hasAnySkillSpecificToken = skills.some((skill) =>
    normalizeTokenId(skill?.overrideTokenKey),
  );

  // If this operator has skill-specific tokens, do not fall back to displayTokenDict
  // on skills that do not actually use a token. This prevents cases like Tragodia S1
  // showing the S2 token by mistake.
  if (hasAnySkillSpecificToken) return null;

  const options = collectOperatorTokenOptions(charData).filter(
    (opt) => opt?.source !== "skill",
  );
  if (options.length === 0) return null;

  return options[0] || null;
}
