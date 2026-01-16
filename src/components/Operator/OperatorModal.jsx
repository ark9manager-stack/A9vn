const OperatorModal = ({ operator, onClose }) => {
  if (!operator) return null;

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

export default OperatorModal;
