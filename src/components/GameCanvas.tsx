import React, { useRef, useEffect, useCallback } from "react";
import useGameLoop from "../hooks/useGameLoop";
import { Player } from "../game/Player";
import { Trash, generateTrash } from "../game/Trash";

interface GameCanvasProps {
  onScore: (score: number) => void;
  onEnergy: (energy: number) => void;
  onGameOver: () => void;
  running: boolean;
}

const WIDTH = 900;
const HEIGHT = 600;
const BUBBLE_COUNT = 18;

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
  const player = useRef(new Player(60, HEIGHT / 2 - 14));
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
      r: 3 + Math.random() * 6,
      speed: 0.3 + Math.random() * 0.7,
      dx: 0.2 + Math.random() * 0.5,
    }))
  );

  const gameLoopCallback = useCallback((dt: number, time: number) => {
    if (!running) return;
    // Scroll du fond
    scroll.current += dt * 0.04;
    // Update player
    player.current.update(dt, WIDTH, HEIGHT);
    // Génération de déchets (de droite à gauche)
    if (time - lastTrashTime.current > 1300 && trashes.current.length < 30) {
      trashes.current.push(generateTrash(HEIGHT, true)); // true = horizontal
      lastTrashTime.current = time;
    }
    // Update trash (déplacement)
    trashes.current.forEach(t => t.update(dt, true)); // true = horizontal
    // Collisions et suppression en un seul passage
    trashes.current = trashes.current.filter(t => {
      if (player.current.collidesWith(t)) {
        if (t.type === 'water') {
          energy.current = Math.min(100, energy.current + 30);
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
      // Bulles animées (optimisé : moins de save/restore)
      bubbles.current.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.fill();
        b.x += b.dx;
        if (b.x - b.r > WIDTH) {
          b.x = -b.r;
          b.y = Math.random() * HEIGHT;
        }
      });
      // Déchets
      trashes.current.forEach(t => t.draw(ctx, true));
      // Sous-marin
      player.current.draw(ctx);
    }
  }, [running]);

  useGameLoop(gameLoopCallback, running);

  // Gestion clavier fluide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!running) return;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        player.current.handleInput(e.key, true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        player.current.handleInput(e.key, false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [running]);

  useEffect(() => {
    if (running) {
      trashes.current = [];
      score.current = 0;
      energy.current = 100;
      lastTrashTime.current = 0;
      scroll.current = 0;
      player.current.x = 60;
      player.current.y = HEIGHT / 2 - 14;
    }
  }, [running]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="border-4 border-blue-800 rounded-lg bg-blue-100 shadow-lg"
      />
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
