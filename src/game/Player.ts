export class Player {
  x: number;
  y: number;
  speed: number = 4.2;
  width: number = 50;
  height: number = 28;
  vx: number = 0;
  vy: number = 0;
  keys: Record<string, boolean> = {};

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
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
    // Corps du sous-marin (ovale orienté droite)
    ctx.beginPath();
    ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
    ctx.fillStyle = "#fbbf24";
    ctx.shadowColor = "#f59e42";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    // Hublot
    ctx.beginPath();
    ctx.arc(this.x + this.width - 15, this.y + this.height / 2, 7, 0, 2 * Math.PI);
    ctx.fillStyle = "#60a5fa";
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1;
    // Hélice (gauche)
    ctx.save();
    ctx.translate(this.x + 10, this.y + this.height / 2);
    ctx.rotate(Math.PI / 6);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(-6, -3, 12, 6);
    ctx.restore();
    // Périscope (dessus)
    ctx.fillStyle = "#64748b";
    ctx.fillRect(this.x + this.width / 2 - 3, this.y - 8, 6, 12);
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y - 8, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  }
} 