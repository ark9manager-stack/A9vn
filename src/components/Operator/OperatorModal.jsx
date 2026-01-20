const OperatorModal = ({ operator, onClose }) => {
  if (!operator) return null;

  const charId = operator?.id || operator?.charId || operator?.char_id || "";
  const titleText = operator?.name_vn || operator?.name || charId;

  const phaseCount = operator?.phases?.length ?? 1;
  const hasElite2 = phaseCount >= 3;
  const hasElite1Art = charId === "char_002_amiya";

  const skinsDict = skinTable?.charSkins || skinTable?.skins || {};

  const eliteMeta = useMemo(() => {
    const e0Key = `${charId}#1`;
    const e1Key = `${charId}#1+`;
    const e2Key = `${charId}#2`;

    const e0 = skinsDict?.[e0Key];
    const e1 = skinsDict?.[e1Key];
    const e2 = skinsDict?.[e2Key];

    return {
      e0: pickDisplaySkin(e0),
      e1: pickDisplaySkin(e1),
      e2: pickDisplaySkin(e2),
    };
  }, [charId, skinsDict]);

  const skinsForChar = useMemo(() => {
    const dict = skinsDict || {};
    const all = Object.values(dict);

    const matched = all.filter((s) => s?.charId === charId);

    const extra = matched.filter((s) => {
      const sid = s?.skinId;
      if (!sid) return false;
      if (sid === `${charId}#1`) return false;
      if (sid === `${charId}#2`) return false;
      if (sid === `${charId}#1+`) return false;
      return sid.startsWith(`${charId}@`);
    });

    return extra
      .map((s) => {
        const display = pickDisplaySkin(s);
        const primaryUrl = buildSkinUrl(charId, s.skinId);
        const fallbackUrl = buildSkinUrl(charId, s.skinId, {
          forceLowerTheme: true,
        });

        return {
          key: s.skinId,
          kind: "skin",
          skinId: s.skinId,
          skinName: display?.skinName ?? null,
          drawerList: display?.drawerList ?? [],
          url: primaryUrl,
          fallbackUrl: fallbackUrl !== primaryUrl ? fallbackUrl : null,
        };
      })
      .filter((x) => !!x.url);
  }, [charId, skinsDict]);

  const options = useMemo(() => {
    if (!charId) return [];

    const out = [];

    out.push({
      key: "E0",
      kind: "elite",
      label: "Elite 0",
      url: buildEliteUrl(charId, "E0"),
      fallbackUrl: null,
      skinName: eliteMeta?.e0?.skinName ?? null,
      drawerList: eliteMeta?.e0?.drawerList ?? [],
      order: 0,
    });

    if (hasElite1Art) {
      out.push({
        key: "E1",
        kind: "elite",
        label: "Elite 1",
        url: buildEliteUrl(charId, "E1"),
        fallbackUrl: null,
        skinName: eliteMeta?.e1?.skinName ?? null,
        drawerList: eliteMeta?.e1?.drawerList ?? [],
        order: 1,
      });
    }

    if (hasElite2) {
      out.push({
        key: "E2",
        kind: "elite",
        label: "Elite 2",
        url: buildEliteUrl(charId, "E2"),
        fallbackUrl: null,
        skinName: eliteMeta?.e2?.skinName ?? null,
        drawerList: eliteMeta?.e2?.drawerList ?? [],
        order: 2,
      });
    }

    const skins = skinsForChar
      .slice()
      .sort((a, b) => String(a.skinId).localeCompare(String(b.skinId)))
      .map((s, idx) => ({
        key: s.key,
        kind: "skin",
        label: s.skinName || s.skinId,
        url: s.url,
        fallbackUrl: s.fallbackUrl || null,
        skinName: s.skinName,
        drawerList: s.drawerList || [],
        order: 100 + idx,
      }));

    return [...out, ...skins].sort((a, b) => a.order - b.order);
  }, [charId, eliteMeta, hasElite1Art, hasElite2, skinsForChar]);

  const [selectedKey, setSelectedKey] = useState(options?.[0]?.key || "E0");

  // image state (supports fallback retry)
  const [imgError, setImgError] = useState(false);
  const [isLoadingImg, setIsLoadingImg] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(null);

  useEffect(() => {
    if (!options.length) return;
    const exists = options.some((o) => o.key === selectedKey);
    if (!exists) setSelectedKey(options[0].key);
  }, [charId, options, selectedKey]);

  const selectedOption = useMemo(() => {
    return options.find((x) => x.key === selectedKey) || options[0];
  }, [options, selectedKey]);

  useEffect(() => {
    let cancelled = false;

    const primary = selectedOption?.url || null;
    const fallback = selectedOption?.fallbackUrl || null;

    // bấm đổi -> ẩn ảnh cũ ngay lập tức
    setImgError(false);
    setIsLoadingImg(!!primary);
    setDisplaySrc(null);

    const load = (src) =>
      new Promise((resolve, reject) => {
        if (!src) return reject(new Error("no-src"));
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = reject;
        img.src = src;
      });

    (async () => {
      try {
        const ok = await load(primary);
        if (cancelled) return;
        setDisplaySrc(ok);
        setIsLoadingImg(false);
      } catch {
        if (fallback) {
          try {
            const ok2 = await load(fallback);
            if (cancelled) return;
            setDisplaySrc(ok2);
            setIsLoadingImg(false);
            return;
          } catch {}
        }
        if (cancelled) return;
        setImgError(true);
        setIsLoadingImg(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedOption?.url, selectedOption?.fallbackUrl, charId, selectedKey]);

  const displaySkinName = useMemo(() => {
    if (!selectedOption) return "";
    if (!selectedOption.skinName) return selectedOption.label;
    return selectedOption.skinName;
  }, [selectedOption]);

  const displayDrawer = useMemo(() => {
    const list = selectedOption?.drawerList || [];
    const arr = Array.isArray(list) ? list.filter(Boolean) : [];
    return arr.length ? arr.join(", ") : "-";
  }, [selectedOption]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="w-[90%] max-w-5xl bg-[#121212] rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT */}
          <div>
            <h2 className="text-3xl font-bold text-white">{operator.name}</h2>
            <p className="text-gray-400 mt-2">{operator.description}</p>
          </div>

          {/* RIGHT */}
          <div className="bg-[#1a1a1a] rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2">Stats (Base)</h3>
            <ul className="text-sm space-y-1">
              <li>HP: {operator.stats?.maxHp}</li>
              <li>ATK: {operator.stats?.atk}</li>
              <li>DEF: {operator.stats?.def}</li>
              <li>RES: {operator.stats?.magicResistance}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
