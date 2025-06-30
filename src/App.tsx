import React, { useState } from "react";
import GameCanvas from "./components/GameCanvas";

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [gameOver, setGameOver] = useState(false);

  const handleScore = (s: number) => setScore(s);
  const handleEnergy = (e: number) => setEnergy(e);
  const handleGameOver = () => setGameOver(true);
  const handleReset = () => {
    setScore(0);
    setEnergy(100);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900">
      <div className="flex flex-col items-center w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mt-8 mb-2 tracking-tight text-center">
          Deep Clean: Mission Océan
        </h1>
        <p className="text-blue-100 text-center mb-6 text-lg max-w-xl">
          Incarne un sous-marin nettoyeur et ramasse un maximum de déchets dans l'océan !<br/>
          <span className="text-blue-200 text-sm">Utilise les flèches du clavier pour te déplacer. Évite de manquer d'énergie !</span>
        </p>
        <div className="flex items-center justify-center w-full min-h-[600px] flex-1">
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 bg-white/90 rounded-3xl shadow-2xl border-8 border-blue-800 p-8">
            {/* Panneau latéral */}
            <div className="bg-gradient-to-b from-blue-200 via-blue-100 to-blue-50 rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-[220px] mb-6 md:mb-0 border-2 border-blue-300">
              <div className="text-2xl font-bold text-blue-900 mb-2">Score</div>
              <div className="text-4xl font-extrabold text-blue-700 mb-4">{score}</div>
              <div className="w-40 h-6 bg-gray-300 rounded relative mb-2">
                <div
                  className="h-6 rounded transition-all absolute left-0 top-0"
                  style={{
                    width: `${energy}%`,
                    background: energy > 30 ? "#22d3ee" : "#f87171",
                  }}
                />
                <span className="absolute w-full text-center text-xs font-bold text-blue-900" style={{lineHeight: '1.5rem'}}>
                  {Math.max(0, Math.floor(energy))} %
                </span>
              </div>
              <div className="text-xs text-blue-700 mb-4">Énergie</div>
              {gameOver ? (
                <>
                  <div className="text-lg text-red-600 font-bold mb-2">Game Over !</div>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition" onClick={handleReset}>
                    Rejouer
                  </button>
                </>
              ) : (
                <button className="px-4 py-2 bg-blue-200 text-blue-900 rounded shadow hover:bg-blue-300 transition mt-2" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>
            {/* Canvas centré dans un encadré */}
            <div className="relative flex flex-col items-center">
              <div className="rounded-2xl shadow-xl border-4 border-blue-400 bg-blue-100/90 p-4 flex flex-col items-center">
                <GameCanvas
                  onScore={handleScore}
                  onEnergy={handleEnergy}
                  onGameOver={handleGameOver}
                  running={!gameOver}
                />
              </div>
            </div>
          </div>
        </div>
        <footer className="mt-10 mb-4 text-blue-200 text-xs text-center opacity-80">
          © {new Date().getFullYear()} Deep Clean. Un mini-jeu React Canvas.
        </footer>
      </div>
    </div>
  );
};

export default App;
