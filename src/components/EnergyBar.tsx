import React from "react";

const EnergyBar: React.FC<{ energy: number }> = ({ energy }) => (
  <div className="w-64 h-6 bg-gray-300 rounded my-2">
    <div
      className="h-6 rounded transition-all"
      style={{
        width: `${energy}%`,
        background: energy > 30 ? "#22d3ee" : "#f87171",
      }}
    />
  </div>
);

export default EnergyBar; 