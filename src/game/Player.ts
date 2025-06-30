export class Player {
  x: number;
  y: number;
  speed: number = 4.2;
  width: number = 100;
  height: number = 56;
  vx: number = 0;
  vy: number = 0;
  keys: Record<string, boolean> = {};
  image?: HTMLImageElement;

  constructor(x: number, y: number, image?: HTMLImageElement) {
    this.x = x;
    this.y = y;
    this.image = image;
  }

  update(dt: number, maxW: number, maxH: number) {
    // Mouvement fluide avec touches multiples
    this.vx = 0;
    this.vy = 0;
    if (this.keys["ArrowUp"]) this.vy = -1;
    if (this.keys["ArrowDown"]) this.vy = 1;
    if (this.keys["ArrowLeft"]) this.vx = -1;
    if (this.keys["ArrowRight"]) this.vx = 1;
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;
    // Limites
    this.x = Math.max(0, Math.min(maxW - this.width, this.x));
    this.y = Math.max(0, Math.min(maxH - this.height, this.y));
  }

  handleInput(key: string, pressed: boolean) {
    this.keys[key] = pressed;
  }

  collidesWith(trash: any) {
    return (
      this.x < trash.x + trash.size &&
      this.x + this.width > trash.x &&
      this.y < trash.y + trash.size &&
      this.y + this.height > trash.y
    );
  }

  draw(ctx: CanvasRenderingContext2D, horizontal = false) {
    ctx.save();
    // Calcul de l'angle d'inclinaison selon vy
    let angle = 0;
    if (this.vy < 0) angle = -0.28; // monte
    if (this.vy > 0) angle = 0.28;  // descend
    if (this.image) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(angle);
      ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
    } else {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(angle);
      // Corps du sous-marin (ovale orienté droite)
      ctx.beginPath();
      ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
      ctx.fillStyle = "#fbbf24";
      ctx.shadowColor = "#f59e42";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      // Hublot
      ctx.beginPath();
      ctx.arc(this.width / 2 - 15, 0, 7, 0, 2 * Math.PI);
      ctx.fillStyle = "#60a5fa";
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      // Hélice (gauche)
      ctx.save();
      ctx.translate(-this.width / 2 + 10, 0);
      ctx.rotate(Math.PI / 6);
      ctx.fillStyle = "#64748b";
      ctx.fillRect(-6, -3, 12, 6);
      ctx.restore();
      // Périscope (dessus)
      ctx.fillStyle = "#64748b";
      ctx.fillRect(-3, -this.height / 2 - 8, 6, 12);
      ctx.beginPath();
      ctx.arc(0, -this.height / 2 - 8, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }
} 