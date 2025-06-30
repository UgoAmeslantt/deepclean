export type TrashType =
  | "bottle"
  | "can"
  | "bag"
  | "water"
  | "bouteille2"
  | "bouteille3"
  | "canette2"
  | "pneus"
  | "sacJaune"
  | "sacVert"
  | "tasseCafe"
  | "tasseCafe2"
  | "boutPlastique"
  | "boutBouteilleVerre"
  // Animaux marins
  | "poisson"
  | "poissonBleu"
  | "poissonRouge"
  | "poissonLumiere"
  | "raie"
  | "tortue"
  | "baleine"
  | "dauphin"
  | "hypocampe"
  | "pieuvre";

export class Trash {
  x: number;
  y: number;
  size: number;
  speed: number;
  type: TrashType;
  image?: HTMLImageElement;
  animOffset: number; // pour oscillation
  angle: number; // pour rotation

  constructor(x: number, y: number, size: number, speed: number, type: TrashType, image?: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.type = type;
    this.image = image;
    this.animOffset = Math.random() * 1000;
    this.angle = 0;
  }

  update(dt: number, horizontal: boolean = false, time: number = 0) {
    if (horizontal) {
      this.x -= this.speed * (dt / 16);
    } else {
      this.y += this.speed * (dt / 16);
    }
    // Animation : oscillation ou rotation selon le type
    if (this.isFishOrAnimal()) {
      // Oscillation personnalisée selon le type
      let oscSpeed = 0.004, oscAmp = 0.7, rotSpeed = 0.003, rotAmp = 0.18;
      if (this.type === "raie" || this.type === "tortue") { oscSpeed = 0.002; oscAmp = 1.2; rotAmp = 0.22; }
      if (this.type.startsWith("poisson")) { oscSpeed = 0.006; oscAmp = 0.5; rotAmp = 0.13; }
      // Accélération aléatoire pour certains poissons
      if (this.type.startsWith("poisson") && Math.random() < 0.01) {
        this.speed += (Math.random() - 0.5) * 0.8;
        this.speed = Math.max(1.2, Math.min(4.5, this.speed));
      }
      this.y += Math.sin((time + this.animOffset) * oscSpeed) * oscAmp;
      this.x += Math.cos((time + this.animOffset) * (oscSpeed * 0.5)) * 0.4;
      this.angle = Math.sin((time + this.animOffset) * rotSpeed) * rotAmp;
    } else if (this.isTrash()) {
      // Déchets : flottement/rotation
      let rotSpeed = 0.002, rotAmp = 0.12;
      if (["pneus", "can", "canette2"].includes(this.type)) { rotSpeed = 0.001; rotAmp = 0.08; }
      this.angle = Math.sin((time + this.animOffset) * rotSpeed) * rotAmp;
    }
  }

  isFishOrAnimal() {
    return [
      "poisson", "poissonBleu", "poissonRouge", "poissonLumiere", "raie", "tortue", "baleine", "dauphin", "hypocampe", "pieuvre"
    ].includes(this.type);
  }
  isTrash() {
    return [
      "bottle", "bouteille2", "bouteille3", "can", "canette2", "pneus", "sacJaune", "sacVert", "tasseCafe", "tasseCafe2", "boutPlastique", "boutBouteilleVerre", "bag", "water"
    ].includes(this.type);
  }

  isOutOfScreen(max: number, horizontal: boolean = false) {
    if (horizontal) {
      return this.x + this.size < 0;
    } else {
      return this.y > max;
    }
  }

  draw(ctx: CanvasRenderingContext2D, horizontal = false, time: number = 0) {
    ctx.save();
    // Clignotement pour les bouteilles d'eau (énergie)
    let blink = 1;
    if (this.type === "water" && time) {
      blink = 0.7 + 0.3 * Math.abs(Math.sin(time * 0.008 + this.animOffset));
      ctx.globalAlpha = blink;
    }
    // Animation : applique la rotation autour du centre
    if (this.angle && this.image) {
      ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
      ctx.rotate(this.angle);
      ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
    } else if (this.image) {
      ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    } else {
      ctx.beginPath();
      ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, 2 * Math.PI);
      ctx.fillStyle = '#aaa';
      ctx.fill();
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