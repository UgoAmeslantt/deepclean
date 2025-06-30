import React, { useState, useEffect } from "react";
import GameCanvas from "./components/GameCanvas";

const GAME_CONTEXT = `
Dans Deep Clean: Mission Océan, tu incarnes un sous-marin nettoyeur chargé de ramasser les déchets qui polluent l'océan tout en évitant les animaux marins. Gère ton énergie grâce aux bouteilles d'oxygène, évite les collisions avec la faune, et tente de battre ton meilleur score ! Chaque geste compte pour préserver la vie sous-marine. Bonne chance, capitaine !`;

const App: React.FC = () => {
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [showAwareness, setShowAwareness] = useState(false);

  const handleScore = (s: number) => setScore(s);
  const handleEnergy = (e: number) => setEnergy(e);
  const handleGameOver = () => setGameOver(true);
  const handleReset = () => {
    setScore(0);
    setEnergy(100);
    setGameOver(false);
  };
  const handleStart = () => {
    setStarted(true);
    handleReset();
  };

  // Estimation du nombre total de déchets dans l'océan (source The Ocean Cleanup)
  const TOTAL_DECHETS = 5_000_000_000_000;
  const percentRamasse = (score / TOTAL_DECHETS) * 100;

  // Affichage pédagogique quand score >= 30 pour la première fois
  useEffect(() => {
    if (score >= 30 && !showAwareness) {
      setShowAwareness(true);
    }
  }, [score, showAwareness]);

  return (
    <div className="min-h-screen min-w-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900">
      <div className="flex flex-col items-center w-full">
        {/* Écran pédagogique */}
        {showAwareness && started && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
            <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-800 p-8 max-w-xl text-blue-900 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Prise de conscience</h2>
              <div className="text-lg mb-4">
                Même après avoir ramassé <span className="font-bold">30 déchets</span>, tu n'as éliminé que&nbsp;
                <span className="font-mono text-blue-700">{percentRamasse.toFixed(15)}%</span> des déchets présents dans l'océan.<br/>
                <span className="text-xs text-blue-700">(soit 0,{"0".repeat(12)}6%...)</span>
              </div>
              <div className="text-base text-blue-800 mb-6">
                La pollution marine est un problème immense : chaque geste compte, mais il faut agir collectivement pour protéger notre planète bleue.<br/>
                <span className="italic">Ensemble, faisons la différence !</span>
              </div>
              <button
                className="px-8 py-3 bg-blue-500 text-white text-xl rounded-full shadow hover:bg-blue-600 transition font-bold"
                onClick={() => setShowAwareness(false)}
              >
                Continuer
              </button>
            </div>
          </div>
        )}
        {!started ? (
          <div className="flex flex-col items-center justify-center w-full h-[90vh]">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mt-8 mb-4 tracking-tight text-center">
              Deep Clean: Mission Océan
            </h1>
            <div className="bg-white/90 rounded-2xl shadow-xl border-4 border-blue-800 p-6 max-w-xl text-blue-900 text-lg text-center mb-8">
              {GAME_CONTEXT.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
            </div>
            <button
              className="px-8 py-3 bg-blue-500 text-white text-2xl rounded-full shadow hover:bg-blue-600 transition font-bold"
              onClick={handleStart}
            >
              Démarrer
            </button>
          </div>
        ) : (
          <>
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
                  {score >= 30 && (
                    <div className="text-xs text-blue-800 mb-2">
                      Tu as ramassé <span className="font-bold">{percentRamasse.toFixed(5)}%</span> des déchets présents dans l'océan !
                    </div>
                  )}
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
                      running={!gameOver && !showAwareness}
                    />
                  </div>
                </div>
              </div>
            </div>
            <footer className="mt-10 mb-4 text-blue-200 text-xs text-center opacity-80">
              © {new Date().getFullYear()} Deep Clean. Un mini-jeu React Canvas.
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
