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
  const [awarenessShown, setAwarenessShown] = useState(false);
  const [pendingAwareness, setPendingAwareness] = useState(false);

  const handleScore = (s: number) => setScore(s);
  const handleEnergy = (e: number) => setEnergy(e);
  const handleGameOver = () => setGameOver(true);
  const handleReset = () => {
    setScore(0);
    setEnergy(100);
    setGameOver(false);
  };
  const handleSoftReset = () => {
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

  // Nouvelle logique pour la pop-up informative et Game Over
  useEffect(() => {
    // Afficher la pop-up la première fois que le score atteint 30 (hors Game Over)
    if (score >= 30 && !awarenessShown && !showAwareness && started && !gameOver) {
      setShowAwareness(true);
      setAwarenessShown(true);
      setPendingAwareness(false);
    }
    // Afficher la pop-up à chaque Game Over (quel que soit le score)
    else if (gameOver && !showAwareness && started) {
      // Si le score >= 30 et la pop-up informative n'a pas encore été vue, on la montrera après le Game Over
      if (score >= 30 && !awarenessShown) {
        setPendingAwareness(true);
        setAwarenessShown(true);
      }
      setShowAwareness(true);
    }
  }, [score, gameOver, showAwareness, started, awarenessShown]);

  // Quand on ferme la pop-up après un Game Over, si la pop-up informative doit être montrée, on la montre
  const handleContinue = () => {
    setShowAwareness(false);
    handleSoftReset();
    setStarted(true);
    if (pendingAwareness) {
      setTimeout(() => setShowAwareness(true), 100);
      setPendingAwareness(false);
    }
  };

  // Musique d'ambiance
  const ambianceRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!ambianceRef.current) {
      ambianceRef.current = new window.Audio('/Sounds/Ambiance_Underwater_Sounds.mp3');
      ambianceRef.current.loop = true;
      ambianceRef.current.volume = 0.5;
    }
    if (started && !showAwareness) {
      ambianceRef.current.play().catch(() => {});
    } else {
      ambianceRef.current.pause();
      ambianceRef.current.currentTime = 0;
    }
  }, [started, showAwareness]);

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900">
      <div className="flex flex-col items-center w-full h-full flex-1 justify-center">
        {/* Écran pédagogique */}
        {showAwareness && started && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
            <div className="bg-white rounded-2xl shadow-2xl border-4 border-blue-800 p-8 max-w-xl text-blue-900 text-center">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Bilan de ta mission</h2>
              <div className="text-lg mb-4">
                Tu as ramassé <span className="font-bold">{score}</span> déchets.<br/>
                Cela représente <span className="font-mono text-blue-700">{percentRamasse.toFixed(10)}%</span> des déchets présents dans l'océan.<br/>
                <span className="text-xs text-blue-700">(soit 0,{"0".repeat(8)}{percentRamasse.toFixed(2).replace('.', '')}%...)</span>
              </div>
              <div className="text-base text-blue-800 mb-6">
                La pollution marine est un problème immense : chaque geste compte, mais il faut agir collectivement pour protéger notre planète bleue.<br/>
                <span className="italic">Ensemble, faisons la différence !</span>
              </div>
              <button
                className="px-8 py-3 bg-blue-500 text-white text-xl rounded-full shadow hover:bg-blue-600 transition font-bold"
                onClick={handleContinue}
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
            {(!showAwareness && started) ? (
              <div className="flex flex-col w-screen min-h-screen bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mt-8 mb-4 tracking-tight text-center">
                  Deep Clean: Mission Océan
                </h1>
                <div className="flex-1 flex items-center justify-center w-full h-full pb-8">
                  <GameCanvas
                    onScore={handleScore}
                    onEnergy={handleEnergy}
                    onGameOver={handleGameOver}
                    running={!gameOver && !showAwareness}
                  />
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
