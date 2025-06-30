export type TrashType = "bottle" | "can" | "bag" | "water";

export class Trash {
  x: number;
  y: number;
  size: number;
  speed: number;
  type: TrashType;

  constructor(x: number, y: number, size: number, speed: number, type: TrashType) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.type = type;
  }

  update(dt: number, horizontal: boolean = false) {
    if (horizontal) {
      this.x -= this.speed * (dt / 16);
    } else {
      this.y += this.speed * (dt / 16);
    }
  }

  isOutOfScreen(max: number, horizontal: boolean = false) {
    if (horizontal) {
      return this.x + this.size < 0;
    } else {
      return this.y > max;
    }
  }

  draw(ctx: CanvasRenderingContext2D, horizontal = false) {
    ctx.save();
    if (this.type === "bottle") {
      // Corps de la bouteille
      ctx.beginPath();
      ctx.ellipse(this.x + this.size / 2, this.y + this.size * 0.6, this.size * 0.18, this.size * 0.38, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "#60a5fa";
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Bouchon
      ctx.beginPath();
      ctx.ellipse(this.x + this.size / 2, this.y + this.size * 0.18, this.size * 0.13, this.size * 0.08, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "#0ea5e9";
      ctx.fill();
      // Étiquette
      ctx.fillStyle = "#a3e635";
      ctx.fillRect(this.x + this.size * 0.28, this.y + this.size * 0.45, this.size * 0.44, this.size * 0.12);
    } else if (this.type === "can") {
      // Corps de la canette
      ctx.beginPath();
      ctx.ellipse(this.x + this.size / 2, this.y + this.size * 0.5, this.size * 0.28, this.size * 0.32, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "#ef4444";
      ctx.shadowColor = "#b91c1c";
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      // Reflet
      ctx.beginPath();
      ctx.ellipse(this.x + this.size / 2 + this.size * 0.09, this.y + this.size * 0.45, this.size * 0.06, this.size * 0.13, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "#fff";
      ctx.globalAlpha = 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Haut et bas
      ctx.fillStyle = "#d1d5db";
      ctx.fillRect(this.x + this.size * 0.22, this.y + this.size * 0.32, this.size * 0.56, this.size * 0.05);
      ctx.fillRect(this.x + this.size * 0.22, this.y + this.size * 0.68, this.size * 0.56, this.size * 0.05);
    } else if (this.type === "water") {
      // Bouteille d'eau (énergie)
      ctx.beginPath();
      ctx.ellipse(this.x + this.size / 2, this.y + this.size * 0.6, this.size * 0.18, this.size * 0.38, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "#38bdf8";
      ctx.globalAlpha = 0.92;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Bouchon
      ctx.beginPath();
      ctx.ellipse(this.x + this.size / 2, this.y + this.size * 0.18, this.size * 0.13, this.size * 0.08, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "#0e7490";
      ctx.fill();
      // Étiquette blanche
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x + this.size * 0.28, this.y + this.size * 0.45, this.size * 0.44, this.size * 0.12);
      // Goutte bleue sur l'étiquette
      ctx.beginPath();
      ctx.arc(this.x + this.size / 2, this.y + this.size * 0.51, this.size * 0.06, 0, 2 * Math.PI);
      ctx.fillStyle = "#38bdf8";
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      // Sac plastique
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.2, this.y + this.size * 0.7);
      ctx.lineTo(this.x + this.size * 0.8, this.y + this.size * 0.7);
      ctx.lineTo(this.x + this.size * 0.7, this.y + this.size * 0.3);
      ctx.lineTo(this.x + this.size * 0.3, this.y + this.size * 0.3);
      ctx.closePath();
      ctx.fillStyle = "#fef08a";
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Poignées
      ctx.beginPath();
      ctx.arc(this.x + this.size * 0.3, this.y + this.size * 0.3, this.size * 0.07, 0, 2 * Math.PI);
      ctx.arc(this.x + this.size * 0.7, this.y + this.size * 0.3, this.size * 0.07, 0, 2 * Math.PI);
      ctx.fillStyle = "#fde047";
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Effet froissé
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(this.x + this.size * 0.5, this.y + this.size * 0.3);
      ctx.lineTo(this.x + this.size * 0.5, this.y + this.size * 0.7);
      ctx.moveTo(this.x + this.size * 0.4, this.y + this.size * 0.5);
      ctx.lineTo(this.x + this.size * 0.6, this.y + this.size * 0.6);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}

export function generateTrash(max: number, horizontal: boolean = false) {
  const size = 24 + Math.random() * 18;
  let x, y;
  if (horizontal) {
    x = max + size;
    y = Math.random() * (max - size);
  } else {
    x = Math.random() * (max - size);
    y = -size;
  }
  const speed = 2 + Math.random() * 2;
  // 1 chance sur 3 d'avoir une bouteille d'eau (plus fréquent)
  const types: TrashType[] = ["bottle", "can", "bag", "water"];
  const weights = [3, 3, 3, 2]; // water plus fréquent
  let pool: TrashType[] = [];
  types.forEach((t, i) => { for (let j = 0; j < weights[i]; j++) pool.push(t); });
  const type = pool[Math.floor(Math.random() * pool.length)];
  return new Trash(x, y, size, speed, type);
} 