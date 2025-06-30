import React from "react";

const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => (
  <div className="text-lg font-semibold text-blue-900 my-2">Score : {score}</div>
);

export default ScoreDisplay; 