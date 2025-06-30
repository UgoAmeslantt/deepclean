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

// Dictionnaire des tailles réalistes (en px) pour chaque type d'objet/animal
const TYPE_SIZES: Record<string, {min: number, max: number}> = {
  // Déchets
  bottle: { min: 48, max: 68 },
  bouteille2: { min: 48, max: 68 },
  bouteille3: { min: 48, max: 68 },
  can: { min: 38, max: 54 },
  canette2: { min: 38, max: 54 },
  pneus: { min: 64, max: 90 },
  sacJaune: { min: 54, max: 70 },
  sacVert: { min: 54, max: 70 },
  tasseCafe: { min: 32, max: 44 },
  tasseCafe2: { min: 32, max: 44 },
  boutPlastique: { min: 28, max: 38 },
  boutBouteilleVerre: { min: 28, max: 38 },
  bag: { min: 54, max: 70 },
  water: { min: 48, max: 68 },
  oxygen: { min: 54, max: 74 },
  // Animaux marins
  poisson: { min: 48, max: 68 },
  poissonBleu: { min: 48, max: 68 },
  poissonRouge: { min: 44, max: 60 },
  poissonLumiere: { min: 40, max: 56 },
  raie: { min: 90, max: 140 },
  tortue: { min: 68, max: 100 },
  baleine: { min: 140, max: 200 },
  dauphin: { min: 90, max: 130 },
  hypocampe: { min: 32, max: 44 },
  pieuvre: { min: 68, max: 100 }
};

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

// Fonction pour dessiner le courant marin visuel (déplacement horizontal vers la gauche)
function drawCurrent(ctx: CanvasRenderingContext2D, time: number) {
  const bandCount = 3;
  for (let i = 0; i < bandCount; i++) {
    const yBase = HEIGHT * (0.25 + 0.25 * i);
    const speed = 0.04 + 0.02 * i; // vitesse différente pour chaque bande
    const offset = (time * speed) % WIDTH;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    for (let x = 0; x <= WIDTH + 40; x += 8) {
      // Décalage horizontal pour l'effet de déplacement
      const xShift = (x + WIDTH - offset) % WIDTH;
      const wave = Math.sin((x / 120) + i) * 12 + Math.cos((x / 60) + i * 2) * 6;
      ctx.lineTo(xShift, yBase + wave);
    }
    ctx.lineTo(WIDTH, yBase + 40);
    ctx.lineTo(0, yBase + 40);
    ctx.closePath();
    ctx.globalAlpha = 0.10 + 0.07 * i;
    ctx.fillStyle = i % 2 === 0 ? '#bae6fd' : '#7dd3fc';
    ctx.filter = 'blur(2px)';
    ctx.fill();
    ctx.filter = 'none';
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
  const lastOxyTime = useRef(0);
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
  // Bulles dynamiques du sous-marin (optimisé via ref)
  const subBubbles = useRef<{x:number, y:number, r:number, vx:number, vy:number, alpha:number, life:number}[]>([]);
  const lastBubbleTime = useRef(0);
  const [lives, setLives] = React.useState(3);
  const [bgKey, setBgKey] = React.useState<string>("bg1");
  // Effets sonores
  const collectSound = useRef<HTMLAudioElement | null>(null);
  const hitSound = useRef<HTMLAudioElement | null>(null);
  const gameOverSound = useRef<HTMLAudioElement | null>(null);

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
    // Liste de tous les types possibles (hors water/oxygen)
    const allTypes = [
      "bottle", "bouteille2", "bouteille3", "can", "canette2", "pneus", "sacJaune", "sacVert", "tasseCafe", "tasseCafe2", "boutPlastique", "boutBouteilleVerre",
      "poisson", "poissonBleu", "poissonRouge", "poissonLumiere", "raie", "tortue", "baleine", "dauphin", "hypocampe", "pieuvre"
    ];
    // On rend la bouteille d'oxygène très fréquente
    const types = ["oxygen","oxygen","oxygen","water", ...allTypes, ...allTypes];
    const type = types[Math.floor(Math.random() * types.length)] as any;
    // Taille logique selon le type
    const sizeRange = TYPE_SIZES[type] || { min: 28, max: 38 };
    const size = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
    let x, y;
    if (horizontal) {
      x = WIDTH + size * 0.2; // spawn juste à droite du canvas
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

    // Spawn bouteille d'oxygène toutes les 15 secondes
    if (time - lastOxyTime.current > 15000) {
      // Taille logique pour l'oxygène
      const sizeRange = TYPE_SIZES['oxygen'] || { min: 54, max: 74 };
      const size = sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
      const x = WIDTH + size * 0.2;
      const y = Math.random() * (HEIGHT - size);
      trashes.current.push(new Trash(x, y, size, 2 + Math.random() * 2, 'oxygen', assets ? assets['oxygen'] : undefined));
      lastOxyTime.current = time;
    }

    // Génération fluide et régulière des bulles derrière le sous-marin si déplacement
    if ((player.current.vx !== 0 || player.current.vy !== 0)) {
      if (time - lastBubbleTime.current > 32) {
        const norm = Math.sqrt(player.current.vx ** 2 + player.current.vy ** 2) || 1;
        const vx = player.current.vx / norm;
        const vy = player.current.vy / norm;
        const px = player.current.x + player.current.width / 2 - vx * (player.current.width / 2) + (vy * 6);
        const py = player.current.y + player.current.height / 2 - vy * (player.current.height / 2) - (vx * 6);
        const speed = 1.2 + Math.random() * 0.7 + norm * 0.7;
        subBubbles.current.push({
          x: px + (Math.random() - 0.5) * 2,
          y: py + (Math.random() - 0.5) * 2,
          r: 3.5 + Math.random() * 2.5,
          vx: -vx * speed * (0.7 + Math.random() * 0.5),
          vy: -vy * speed * (0.7 + Math.random() * 0.5),
          alpha: 0.22 + Math.random() * 0.18,
          life: 0
        });
        if (subBubbles.current.length > 40) subBubbles.current = subBubbles.current.slice(-40);
        lastBubbleTime.current = time;
      }
    }
    // Animation des bulles du sous-marin (interpolation douce)
    subBubbles.current = subBubbles.current
      .map(b => ({
        ...b,
        x: b.x + (b.vx || 0) * (dt / 16),
        y: b.y + (b.vy || 0) * (dt / 16),
        r: b.r * 0.985,
        alpha: b.alpha * 0.975,
        life: b.life + dt
      }))
      .filter(b => b.r > 0.7 && b.alpha > 0.04 && b.life < 1400);

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
        if (t.type === 'oxygen') {
          energy.current = Math.min(100, energy.current + 30);
        } else if (t.type === 'water') {
          energy.current = Math.min(100, energy.current + 20);
        } else if (["poisson", "poissonBleu", "poissonRouge", "poissonLumiere", "raie", "tortue", "baleine", "dauphin", "hypocampe", "pieuvre"].includes(t.type)) {
          setLives(l => {
            if (l > 1) return l - 1;
            onGameOver();
            // Effet sonore collision animal
            if (hitSound.current) { hitSound.current.currentTime = 0; hitSound.current.play(); }
            // Effet sonore game over
            setTimeout(() => { if (gameOverSound.current) { gameOverSound.current.currentTime = 0; gameOverSound.current.play(); } }, 100);
            return 0;
          });
        } else {
          score.current += 1;
          onScore(score.current);
          // Effet sonore collecte déchet
          if (collectSound.current) { collectSound.current.currentTime = 0; collectSound.current.play(); }
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
      // Affichage du fond marin image
      if (assets && bgKey && assets[bgKey]) {
        ctx.drawImage(assets[bgKey], 0, 0, WIDTH, HEIGHT);
      } else {
        drawBackground(ctx, scroll.current);
      }
      // Effet courant marin visuel
      drawCurrent(ctx, time);
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
      subBubbles.current.forEach(b => {
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
      trashes.current.forEach(t => {
        if (t.image) {
          const ratio = t.image.width / t.image.height;
          let drawW = t.size, drawH = t.size;
          if (ratio > 1) { drawW = t.size; drawH = t.size / ratio; }
          else { drawH = t.size; drawW = t.size * ratio; }
          ctx.save();
          // Flip horizontal pour les animaux marins sauf hypocampe
          const isAnimal = [
            "poisson", "poissonBleu", "poissonRouge", "poissonLumiere", "raie", "tortue", "baleine", "dauphin", "pieuvre"
          ].includes(t.type);
          if (isAnimal) {
            ctx.translate(t.x + drawW / 2, t.y + drawH / 2);
            ctx.scale(-1, 1); // flip horizontal
            if (t.angle) ctx.rotate(t.angle);
            ctx.globalAlpha = t.type === 'water' || t.type === 'oxygen' ? 0.85 : 1;
            ctx.drawImage(t.image, -drawW / 2, -drawH / 2, drawW, drawH);
          } else if (t.type === 'hypocampe') {
            ctx.translate(t.x + drawW / 2, t.y + drawH / 2);
            if (t.angle) ctx.rotate(t.angle);
            ctx.globalAlpha = 1;
            ctx.drawImage(t.image, -drawW / 2, -drawH / 2, drawW, drawH);
          } else if (t.angle) {
            ctx.translate(t.x + drawW / 2, t.y + drawH / 2);
            ctx.rotate(t.angle);
            ctx.globalAlpha = t.type === 'water' || t.type === 'oxygen' ? 0.85 : 1;
            ctx.drawImage(t.image, -drawW / 2, -drawH / 2, drawW, drawH);
          } else {
            ctx.globalAlpha = t.type === 'water' || t.type === 'oxygen' ? 0.85 : 1;
            ctx.drawImage(t.image, t.x, t.y, drawW, drawH);
          }
          ctx.globalAlpha = 1;
          ctx.restore();
        } else {
          t.draw(ctx, true, performance.now());
        }
      });
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

      // Draw score and energy overlay
      if (running) {
        ctx.save();
        ctx.font = 'bold 32px Arial, sans-serif';
        ctx.textBaseline = 'top';
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#fff';
        // Score (top left)
        ctx.fillText(`Score: ${score.current}`, 24, 24);
        // Energy (top right)
        ctx.textAlign = 'right';
        ctx.fillText(`Énergie: ${Math.max(0, Math.floor(energy.current))} %`, WIDTH - 24, 24);
        ctx.restore();
      }
    }
  }, [running, ready, assets, onScore, onEnergy, onGameOver, bgKey]);

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
      lastOxyTime.current = 0;
      scroll.current = 0;
      player.current.x = 60;
      player.current.y = HEIGHT / 2 - 14;
      setLives(3);
      // Choix du fond marin aléatoire
      const bgs = ["bg1", "bg2", "bg3", "bg4"];
      setBgKey(bgs[Math.floor(Math.random() * bgs.length)]);
    }
  }, [running, ready]);

  useEffect(() => {
    collectSound.current = new window.Audio('/Sounds/collect.mp3');
    collectSound.current.volume = 0.7;
    hitSound.current = new window.Audio('/Sounds/hit.mp3');
    hitSound.current.volume = 0.7;
    gameOverSound.current = new window.Audio('/Sounds/gameover.mp3');
    gameOverSound.current.volume = 0.7;
  }, []);

  // Responsive resize: scale canvas to fit parent while keeping internal resolution
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Use window size for maximum canvas area
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      // Maintain aspect ratio
      const scale = Math.min(windowWidth / WIDTH, windowHeight / HEIGHT);
      canvas.style.width = `${WIDTH * scale}px`;
      canvas.style.height = `${HEIGHT * scale}px`;
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!ready) {
    return <div className="flex items-center justify-center w-full h-full text-blue-900 text-xl">Chargement des images...</div>;
  }

  return (
    <div className="w-full h-full flex items-center justify-center fixed inset-0">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="block bg-blue-200 rounded-xl shadow-lg border-2 border-blue-300"
        style={{ width: '100%', height: '100%', aspectRatio: '900/600', display: 'block', objectFit: 'contain' }}
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
