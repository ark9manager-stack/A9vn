import React from "react";

const OperatorProfile = ({ operator }) => {
  return (
    <div className="bg-[#1b1b1b] rounded-xl p-4 text-gray-200">
      <h3 className="text-lg font-semibold mb-2">Profile</h3>

      <div className="text-sm space-y-1">
        <p>
          <b>Codename:</b> {operator.name}
        </p>
        <p>
          <b>Faction:</b> Rhodes Island
        </p>
        <p>
          <b>VA:</b> ---
        </p>
        <p>
          <b>Race:</b> ---
        </p>
      </div>
    </div>
  );
};

export default OperatorProfile;
