import React, { useRef, useEffect, useCallback } from "react";
import useGameLoop from "../hooks/useGameLoop";
import { Player } from "../game/Player";
import { Trash, generateTrash } from "../game/Trash";
import { loadAllAssets } from "../game/assets";

interface GameCanvasProps {
  onScore: (score: number) => void;
  onEnergy: (energy: number) => void;
  onGameOver: () => void;
  running: boolean;
}

const WIDTH = 900;
const HEIGHT = 600;
const BUBBLE_COUNT = 32;

function drawBackground(ctx: CanvasRenderingContext2D, scroll: number) {
  // Dégradé bleu horizontal
  const grad = ctx.createLinearGradient(0, 0, WIDTH, 0);
  grad.addColorStop(0, "#3b82f6");
  grad.addColorStop(1, "#1e293b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // Rochers
  ctx.save();
  ctx.fillStyle = "#334155";
  ctx.beginPath();
  ctx.ellipse(30 + (scroll % 120), HEIGHT - 40, 30, 12, 0, 0, 2 * Math.PI);
  ctx.ellipse(180 + (scroll % 200), HEIGHT - 18, 24, 8, 0, 0, 2 * Math.PI);
  ctx.ellipse(500 + (scroll % 300), HEIGHT - 30, 40, 14, 0, 0, 2 * Math.PI);
  ctx.ellipse(800 + (scroll % 400), HEIGHT - 50, 60, 18, 0, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
  // Algues
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    const baseY = HEIGHT - 20;
    ctx.moveTo(80 + i * 100 + (scroll % 80), baseY);
    ctx.bezierCurveTo(90 + i * 100 + (scroll % 80), baseY - 30, 70 + i * 100 + (scroll % 80), baseY - 50, 80 + i * 100 + (scroll % 80), baseY - 80);
    ctx.stroke();
    ctx.restore();
  }
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onScore, onEnergy, onGameOver, running }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [assets, setAssets] = React.useState<Record<string, HTMLImageElement> | null>(null);
  const [ready, setReady] = React.useState(false);
  const player = useRef<Player | null>(null);
  const trashes = useRef<Trash[]>([]);
  const score = useRef(0);
  const energy = useRef(100);
  const lastTrashTime = useRef(0);
  const scroll = useRef(0);
  // Bulles animées
  const bubbles = useRef(
    Array.from({ length: BUBBLE_COUNT }, () => ({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      r: 2 + Math.random() * 10,
      speed: 0.4 + Math.random() * 1.2,
      dx: (Math.random() - 0.5) * 0.7,
      alpha: 0.10 + Math.random() * 0.18,
      z: Math.random() > 0.7 ? 1 : 0 // 30% passent devant les poissons
    }))
  );
  // Bulles dynamiques du sous-marin
  const [subBubbles, setSubBubbles] = React.useState<{x:number, y:number, r:number, vx:number, vy:number, alpha:number, life:number}[]>([]);
  const [lives, setLives] = React.useState(3);

  // Chargement des assets au montage
  React.useEffect(() => {
    loadAllAssets().then((loaded) => {
      setAssets(loaded);
      setReady(true);
    });
  }, []);

  // Initialisation du player avec image
  React.useEffect(() => {
    if (assets) {
      player.current = new Player(60, HEIGHT / 2 - 14, assets["player"]);
    }
  }, [assets]);

  // Génération d'obstacle/animal avec image
  function generateTrashWithImage(max: number, horizontal: boolean = false) {
    // Liste de tous les types possibles (hors water)
    const allTypes = [
      "bottle", "bouteille2", "bouteille3", "can", "canette2", "pneus", "sacJaune", "sacVert", "tasseCafe", "tasseCafe2", "boutPlastique", "boutBouteilleVerre",
      "poisson", "poissonBleu", "poissonRouge", "poissonLumiere", "raie", "tortue", "baleine", "dauphin", "hypocampe", "pieuvre"
    ];
    // On garde water plus fréquent
    const types = ["water", ...allTypes, ...allTypes];
    const type = types[Math.floor(Math.random() * types.length)] as any;
    const size = 32 + Math.random() * 24;
    let x, y;
    if (horizontal) {
      x = max + size;
      y = Math.random() * (max - size);
    } else {
      x = Math.random() * (max - size);
      y = -size;
    }
    const speed = 2 + Math.random() * 2;
    return new Trash(x, y, size, speed, type, assets ? assets[type] : undefined);
  }

  const gameLoopCallback = useCallback((dt: number, time: number) => {
    if (!running || !ready || !player.current) return;
    // Scroll du fond
    scroll.current += dt * 0.04;
    // Update player
    player.current.update(dt, WIDTH, HEIGHT);

    // Génération de bulles derrière le sous-marin si déplacement
    if ((player.current.vx !== 0 || player.current.vy !== 0)) {
      // Calcul du vecteur vitesse normalisé
      const norm = Math.sqrt(player.current.vx ** 2 + player.current.vy ** 2) || 1;
      const vx = player.current.vx / norm;
      const vy = player.current.vy / norm;
      // Position arrière du sous-marin (opposé au déplacement)
      const px = player.current.x + player.current.width / 2 - vx * (player.current.width / 2) + (vy * 6);
      const py = player.current.y + player.current.height / 2 - vy * (player.current.height / 2) - (vx * 6);
      // Vitesse de la bulle opposée au déplacement du sous-marin
      const speed = 1.2 + Math.random() * 0.7 + norm * 0.7;
      setSubBubbles(bubs => [
        ...bubs,
        {
          x: px + (Math.random() - 0.5) * 4,
          y: py + (Math.random() - 0.5) * 4,
          r: 3 + Math.random() * 4,
          vx: -vx * speed + (Math.random() - 0.5) * 0.5,
          vy: -vy * speed + (Math.random() - 0.5) * 0.5,
          alpha: 0.22 + Math.random() * 0.18,
          life: 0
        }
      ].slice(-30)); // max 30 bulles
    }
    // Animation des bulles du sous-marin
    setSubBubbles(bubs => bubs
      .map(b => ({ ...b, x: b.x + (b.vx || 0), y: b.y + (b.vy || 0), r: b.r * 0.98, alpha: b.alpha * 0.97, life: b.life + dt }))
      .filter(b => b.r > 0.8 && b.alpha > 0.05 && b.life < 1200)
    );

    // Génération de déchets/animaux (de droite à gauche)
    if (time - lastTrashTime.current > 1300 && trashes.current.length < 30) {
      trashes.current.push(generateTrashWithImage(HEIGHT, true));
      lastTrashTime.current = time;
    }
    // Update trash (déplacement)
    trashes.current.forEach(t => t.update(dt, true, time)); // true = horizontal, passage du temps pour l'animation
    // Collisions et suppression en un seul passage
    trashes.current = trashes.current.filter(t => {
      if (player.current && player.current.collidesWith(t)) {
        if (t.type === 'water') {
          energy.current = Math.min(100, energy.current + 30);
        } else if (["poisson", "poissonBleu", "poissonRouge", "poissonLumiere", "raie", "tortue", "baleine", "dauphin", "hypocampe", "pieuvre"].includes(t.type)) {
          // Collision avec un animal : perte de vie
          setLives(l => {
            if (l > 1) return l - 1;
            // Game over si plus de vie
            onGameOver();
            return 0;
          });
        } else {
          score.current += 1;
          onScore(score.current);
        }
        return false; // supprimé
      }
      return !t.isOutOfScreen(WIDTH, true);
    });
    // Énergie (encore plus ralentie)
    energy.current -= dt * 0.004; // 1.5x plus lent que précédemment
    onEnergy(Math.max(0, Math.floor(energy.current)));
    if (energy.current <= 0) onGameOver();
    // Dessin
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      drawBackground(ctx, scroll.current);
      // Bulles animées (derrière)
      bubbles.current.filter(b => b.z === 0).forEach(b => {
        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#bae6fd";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
        b.x += b.dx * 0.5;
        b.y -= b.speed;
        if (b.y + b.r < 0) {
          b.y = HEIGHT + b.r;
          b.x = Math.random() * WIDTH;
        }
        if (b.x < -b.r || b.x > WIDTH + b.r) {
          b.x = Math.random() * WIDTH;
        }
      });
      // Bulles du sous-marin (derrière le sous-marin)
      subBubbles.forEach(b => {
        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
        ctx.fillStyle = "#bae6fd";
        ctx.shadowColor = "#7dd3fc";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      });
      // Déchets/animaux
      trashes.current.forEach(t => t.draw(ctx, true, time));
      // Bulles animées (devant)
      bubbles.current.filter(b => b.z === 1).forEach(b => {
        ctx.save();
        ctx.globalAlpha = b.alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#bae6fd";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
        b.x += b.dx * 0.5;
        b.y -= b.speed;
        if (b.y + b.r < 0) {
          b.y = HEIGHT + b.r;
          b.x = Math.random() * WIDTH;
        }
        if (b.x < -b.r || b.x > WIDTH + b.r) {
          b.x = Math.random() * WIDTH;
        }
      });
      // Sous-marin
      player.current.draw(ctx);
    }
  }, [running, ready, assets, onScore, onEnergy, onGameOver]);

  useGameLoop(gameLoopCallback, running && ready);

  // Gestion clavier fluide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!running || !player.current) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        player.current.handleInput(e.key, true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        player.current && player.current.handleInput(e.key, false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [running, ready]);

  useEffect(() => {
    if (running && ready && player.current) {
      trashes.current = [];
      score.current = 0;
      energy.current = 100;
      lastTrashTime.current = 0;
      scroll.current = 0;
      player.current.x = 60;
      player.current.y = HEIGHT / 2 - 14;
      setLives(3);
    }
  }, [running, ready]);

  if (!ready) {
    return <div className="flex items-center justify-center w-full h-full text-blue-900 text-xl">Chargement des images...</div>;
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="border-4 border-blue-800 rounded-lg bg-blue-100 shadow-lg"
      />
      {/* Affichage des cœurs (vies) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} style={{ fontSize: 28, opacity: i < lives ? 1 : 0.25, transition: 'opacity 0.2s' }}>❤️</span>
        ))}
      </div>
      {/* Affichage score et énergie sur le canvas */}
      <div className="absolute top-2 left-2 bg-white/80 rounded px-3 py-1 text-blue-900 font-bold text-lg shadow">
        Score : {score.current}
      </div>
      <div className="absolute top-2 right-2">
        <div className="w-48 h-6 bg-gray-300 rounded relative">
          <div
            className="h-6 rounded transition-all absolute left-0 top-0"
            style={{
              width: `${energy.current}%`,
              background: energy.current > 30 ? "#22d3ee" : "#f87171",
            }}
          />
          <span className="absolute w-full text-center text-xs font-bold text-blue-900" style={{lineHeight: '1.5rem'}}>
            {Math.max(0, Math.floor(energy.current))} %
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;
