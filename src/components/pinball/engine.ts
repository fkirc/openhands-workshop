/**
 * Tiny deterministic pinball engine.
 *
 * Pure math + state, no DOM access, so it can run anywhere. The React
 * component owns the requestAnimationFrame loop, input and drawing.
 */

export const BOARD_W = 440;
export const BOARD_H = 760;

const BALL_R = 9;
const GRAVITY = 1500;
const MAX_SPEED = 1700;
const SUBSTEPS = 4;

export type FlipperSide = "left" | "right";
export type GameState = "idle" | "playing" | "gameover";

export interface Vec {
  x: number;
  y: number;
}

interface Segment {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  restitution: number;
  /** Extra outward impulse, used by the slingshots. */
  kick: number;
  kind: "wall" | "sling";
}

interface Bumper {
  x: number;
  y: number;
  r: number;
  score: number;
  /** Flash intensity 0..1, decays over time. */
  lit: number;
}

interface DropTarget {
  x: number;
  y: number;
  w: number;
  h: number;
  down: boolean;
  lit: number;
}

interface Flipper {
  px: number;
  py: number;
  len: number;
  half: number;
  rest: number;
  active: number;
  angle: number;
  omega: number;
  pressed: boolean;
}

const MAX_OMEGA = 24;

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

export interface ScoreEvent {
  points: number;
  label: string;
  x: number;
  y: number;
  /** 0..1 age used for fade-out. */
  life: number;
}

export class PinballEngine {
  state: GameState = "idle";
  score = 0;
  ballsLeft = 3;
  highScore = 0;

  readonly ball: Vec = { x: BOARD_W / 2, y: 120 };
  private vel: Vec = { x: 0, y: 0 };
  private segments: Segment[] = [];
  private bumpers: Bumper[] = [];
  private targets: DropTarget[] = [];
  private posts: Bumper[] = [];
  private leftFlipper: Flipper;
  private rightFlipper: Flipper;
  private events: ScoreEvent[] = [];
  private targetCombo = 0;
  private shake = 0;

  constructor() {
    this.buildBoard();
    this.leftFlipper = this.makeFlipper("left");
    this.rightFlipper = this.makeFlipper("right");
  }

  // ---------------------------------------------------------------- geometry

  private makeFlipper(side: FlipperSide): Flipper {
    const left = side === "left";
    return {
      px: left ? 146 : BOARD_W - 146,
      py: 656,
      len: 66,
      half: 6,
      rest: left ? 0.55 : Math.PI - 0.55,
      active: left ? -0.45 : Math.PI + 0.45,
      angle: left ? 0.55 : Math.PI - 0.55,
      omega: 0,
      pressed: false,
    };
  }

  private wall(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    restitution = 0.35,
  ): Segment {
    return { ax, ay, bx, by, restitution, kick: 0, kind: "wall" };
  }

  private buildBoard() {
    const w = 6;
    this.segments = [
      // Outer cabinet.
      this.wall(0, 0, BOARD_W, 0),
      this.wall(0, 0, 0, BOARD_H),
      this.wall(BOARD_W, 0, BOARD_W, BOARD_H),
      this.wall(0, w, BOARD_W * 0.5 - 44, w),
      this.wall(BOARD_W * 0.5 + 44, w, BOARD_W, w),

      // Upper guide rails that funnel the ball back down.
      this.wall(30, 120, 120, 96, 0.4),
      this.wall(BOARD_W - 30, 120, BOARD_W - 120, 96, 0.4),

      // Slanted funnel walls that lead to the drain.
      this.wall(w, 500, 198, 742),
      this.wall(BOARD_W - w, 500, BOARD_W - 198, 742),

      // Slingshots.
      { ax: 60, ay: 430, bx: 150, by: 520, restitution: 0.5, kick: 320, kind: "sling" },
      { ax: BOARD_W - 60, ay: 430, bx: BOARD_W - 150, by: 520, restitution: 0.5, kick: 320, kind: "sling" },
    ];

    this.bumpers = [
      { x: 132, y: 218, r: 22, score: 100, lit: 0 },
      { x: BOARD_W - 132, y: 218, r: 22, score: 100, lit: 0 },
      { x: BOARD_W / 2, y: 312, r: 22, score: 100, lit: 0 },
    ];

    this.posts = [
      { x: 220, y: 150, r: 12, score: 25, lit: 0 },
      { x: 96, y: 300, r: 11, score: 25, lit: 0 },
      { x: BOARD_W - 96, y: 300, r: 11, score: 25, lit: 0 },
    ];

    this.targets = [];
    for (let i = 0; i < 4; i++) {
      this.targets.push({
        x: 96 + i * 62,
        y: 108,
        w: 50,
        h: 12,
        down: false,
        lit: 0,
      });
    }
  }

  // ----------------------------------------------------------------- control

  setFlipper(side: FlipperSide, pressed: boolean) {
    const f = side === "left" ? this.leftFlipper : this.rightFlipper;
    f.pressed = pressed;
  }

  start() {
    this.state = "playing";
    this.score = 0;
    this.ballsLeft = 3;
    this.targetCombo = 0;
    this.events = [];
    for (const t of this.targets) t.down = false;
    this.launchBall();
  }

  private launchBall() {
    this.ball.x = BOARD_W / 2 + (Math.random() - 0.5) * 30;
    this.ball.y = 120;
    this.vel.x = (Math.random() - 0.5) * 120;
    this.vel.y = 60;
    this.shake = 0;
  }

  private drain() {
    this.ballsLeft -= 1;
    if (this.ballsLeft <= 0) {
      this.state = "gameover";
      this.highScore = Math.max(this.highScore, this.score);
    } else {
      this.launchBall();
    }
  }

  private award(points: number, label: string, x: number, y: number) {
    this.score += points;
    this.events.push({ points, label, x, y, life: 0 });
    if (this.events.length > 24) this.events.shift();
  }

  // ------------------------------------------------------------------ physics

  step(dt: number) {
    const clamped = clamp(dt, 0, 1 / 30);
    const h = clamped / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) this.substep(h);
    for (const b of this.bumpers) b.lit = Math.max(0, b.lit - clamped * 3);
    for (const p of this.posts) p.lit = Math.max(0, p.lit - clamped * 3);
    for (const t of this.targets) t.lit = Math.max(0, t.lit - clamped * 3);
    for (const e of this.events) e.life += clamped;
    this.events = this.events.filter((e) => e.life < 1.1);
    this.shake = Math.max(0, this.shake - clamped * 2);
  }

  private substep(h: number) {
    this.updateFlippers(h);
    if (this.state !== "playing") return;

    const v = this.vel;
    v.y += GRAVITY * h;
    const speed = Math.hypot(v.x, v.y);
    if (speed > MAX_SPEED) {
      v.x = (v.x / speed) * MAX_SPEED;
      v.y = (v.y / speed) * MAX_SPEED;
    }
    this.ball.x += v.x * h;
    this.ball.y += v.y * h;

    for (const s of this.segments) this.collideSegment(s);
    for (const b of this.bumpers) this.collideBumper(b);
    for (const p of this.posts) this.collideBumper(p);
    for (const t of this.targets) this.collideTarget(t);
    this.collideFlipper(this.leftFlipper);
    this.collideFlipper(this.rightFlipper);

    if (this.ball.y > BOARD_H + 30) this.drain();
  }

  private updateFlippers(h: number) {
    for (const f of [this.leftFlipper, this.rightFlipper]) {
      const target = f.pressed ? f.active : f.rest;
      const prev = f.angle;
      const maxStep = MAX_OMEGA * h;
      f.angle += clamp(target - f.angle, -maxStep, maxStep);
      f.omega = (f.angle - prev) / h;
    }
  }

  private collideSegment(s: Segment) {
    const b = this.ball;
    const dx = s.bx - s.ax;
    const dy = s.by - s.ay;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 0 ? ((b.x - s.ax) * dx + (b.y - s.ay) * dy) / lenSq : 0;
    t = clamp(t, 0, 1);
    const cx = s.ax + dx * t;
    const cy = s.ay + dy * t;
    let nx = b.x - cx;
    let ny = b.y - cy;
    const dist = Math.hypot(nx, ny);
    if (dist >= BALL_R || dist === 0) return;
    nx /= dist;
    ny /= dist;
    this.ball.x = cx + nx * BALL_R;
    this.ball.y = cy + ny * BALL_R;
    const vn = this.vel.x * nx + this.vel.y * ny;
    if (vn < 0) {
      const j = -(1 + s.restitution) * vn;
      this.vel.x += j * nx;
      this.vel.y += j * ny;
    }
    if (s.kick > 0) {
      this.vel.x += nx * s.kick;
      this.vel.y += ny * s.kick;
      this.award(50, "SLING", cx, cy);
      this.shake = Math.min(1, this.shake + 0.4);
    }
  }

  private collideBumper(b: Bumper) {
    const ball = this.ball;
    let nx = ball.x - b.x;
    let ny = ball.y - b.y;
    let dist = Math.hypot(nx, ny);
    const min = BALL_R + b.r;
    if (dist >= min) return;
    if (dist === 0) {
      nx = 0;
      ny = -1;
      dist = 1;
    }
    nx /= dist;
    ny /= dist;
    ball.x = b.x + nx * min;
    ball.y = b.y + ny * min;
    const vn = this.vel.x * nx + this.vel.y * ny;
    if (vn < 0) {
      const j = -(1 + 1.35) * vn;
      this.vel.x += j * nx;
      this.vel.y += j * ny;
    }
    this.vel.x += nx * 120;
    this.vel.y += ny * 120;
    b.lit = 1;
    this.award(b.score, b.score >= 100 ? "BUMPER" : "POST", b.x, b.y);
  }

  private collideTarget(t: DropTarget) {
    if (t.down) return;
    const ball = this.ball;
    const nx = clamp(ball.x, t.x, t.x + t.w);
    const ny = clamp(ball.y, t.y, t.y + t.h);
    const dx = ball.x - nx;
    const dy = ball.y - ny;
    const dist = Math.hypot(dx, dy);
    if (dist >= BALL_R) return;
    let nX = dx;
    let nY = dy;
    if (dist === 0) {
      nX = 0;
      nY = -1;
    } else {
      nX /= dist;
      nY /= dist;
    }
    ball.x = nx + nX * BALL_R;
    ball.y = ny + nY * BALL_R;
    const vn = this.vel.x * nX + this.vel.y * nY;
    if (vn < 0) {
      const j = -(1 + 0.3) * vn;
      this.vel.x += j * nX;
      this.vel.y += j * nY;
    }
    t.down = true;
    t.lit = 1;
    this.award(500, "TARGET", t.x + t.w / 2, t.y);
    if (this.targets.every((x) => x.down)) {
      this.targetCombo += 1;
      this.award(5000 * this.targetCombo, "ALL TARGETS!", BOARD_W / 2, 150);
      for (const x of this.targets) {
        x.down = false;
        x.lit = 1;
      }
    }
  }

  private collideFlipper(f: Flipper) {
    const ball = this.ball;
    const tipX = f.px + Math.cos(f.angle) * f.len;
    const tipY = f.py + Math.sin(f.angle) * f.len;
    const dx = tipX - f.px;
    const dy = tipY - f.py;
    const lenSq = dx * dx + dy * dy;
    let t = ((ball.x - f.px) * dx + (ball.y - f.py) * dy) / lenSq;
    t = clamp(t, 0, 1);
    const cx = f.px + dx * t;
    const cy = f.py + dy * t;
    let nx = ball.x - cx;
    let ny = ball.y - cy;
    let dist = Math.hypot(nx, ny);
    const min = BALL_R + f.half;
    if (dist >= min) return;
    if (dist === 0) {
      nx = 0;
      ny = -1;
      dist = 1;
    }
    nx /= dist;
    ny /= dist;
    ball.x = cx + nx * min;
    ball.y = cy + ny * min;

    // Surface velocity from the flipper's rotation about its pivot.
    const rx = cx - f.px;
    const ry = cy - f.py;
    const surfX = -f.omega * ry;
    const surfY = f.omega * rx;
    const relX = this.vel.x - surfX;
    const relY = this.vel.y - surfY;
    const vn = relX * nx + relY * ny;
    if (vn < 0) {
      const j = -(1 + 0.4) * vn;
      this.vel.x += j * nx;
      this.vel.y += j * ny;
    }
  }

  // ------------------------------------------------------------------ render

  /** Fifties look: chrome cabinet, cream playfield, warm enamel colours. */
  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const sx = w / BOARD_W;
    const sy = h / BOARD_H;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    if (this.shake > 0) {
      ctx.translate(
        Math.sin(this.shake * 40) * this.shake * 3,
        Math.cos(this.shake * 37) * this.shake * 3,
      );
    }
    ctx.scale(sx, sy);

    this.drawPlayfield(ctx);
    this.drawTargets(ctx);
    this.drawSlingshots(ctx);
    this.drawBumpers(ctx);
    this.drawPosts(ctx);
    this.drawFlippers(ctx);
    if (this.state === "playing") this.drawBall(ctx);
    this.drawEvents(ctx);

    ctx.restore();
  }

  private drawPlayfield(ctx: CanvasRenderingContext2D) {
    const bg = ctx.createLinearGradient(0, 0, 0, BOARD_H);
    bg.addColorStop(0, "#f4e8c9");
    bg.addColorStop(0.55, "#ead9b0");
    bg.addColorStop(1, "#dcc79a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    // Printed arcs, a hallmark of fifties playfields.
    ctx.strokeStyle = "rgba(193,39,45,0.35)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(BOARD_W / 2, 250, 90 + i * 34, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(31,58,95,0.35)";
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.quadraticCurveTo(BOARD_W / 2, 330, BOARD_W, 400);
    ctx.stroke();

    ctx.fillStyle = "rgba(31,58,95,0.5)";
    ctx.font = "bold 20px Georgia, 'Times New Roman', serif";
    ctx.textAlign = "center";
    ctx.fillText("FIFTIES FLIPPER", BOARD_W / 2, 460);
    ctx.font = "italic 12px Georgia, 'Times New Roman', serif";
    ctx.fillText("insert coin  •  play ball", BOARD_W / 2, 480);
    ctx.textAlign = "left";
  }

  private drawTargets(ctx: CanvasRenderingContext2D) {
    for (const t of this.targets) {
      ctx.save();
      if (t.down) {
        ctx.fillStyle = "rgba(31,58,95,0.12)";
        ctx.fillRect(t.x, t.y, t.w, t.h);
      } else {
        ctx.fillStyle = t.lit > 0 ? "#ffd987" : "#c1272d";
        ctx.fillRect(t.x, t.y, t.w, t.h);
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillRect(t.x + 2, t.y + 2, t.w - 4, 2);
        ctx.fillStyle = "#f4e8c9";
        ctx.font = "bold 9px Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText("500", t.x + t.w / 2, t.y + 10);
        ctx.textAlign = "left";
      }
      ctx.restore();
    }
  }

  private drawSlingshots(ctx: CanvasRenderingContext2D) {
    for (const s of this.segments) {
      if (s.kind !== "sling") continue;
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.lineTo(s.ax, s.by);
      ctx.closePath();
      ctx.fillStyle = "#e9b44c";
      ctx.fill();
      ctx.strokeStyle = "#1f3a5f";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.strokeStyle = "#2a9d8f";
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  private drawBumpers(ctx: CanvasRenderingContext2D) {
    for (const b of this.bumpers) {
      const glow = b.lit;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(233,180,76,${0.15 + glow * 0.5})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = glow > 0 ? "#ffe9a8" : "#c1272d";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#8f1b1f";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = glow > 0 ? "#ffffff" : "#e9b44c";
      ctx.fill();
    }
  }

  private drawPosts(ctx: CanvasRenderingContext2D) {
    for (const p of this.posts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.lit > 0 ? "#ffe9a8" : "#2a9d8f";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#1f3a5f";
      ctx.stroke();
    }
  }

  private drawFlippers(ctx: CanvasRenderingContext2D) {
    for (const f of [this.leftFlipper, this.rightFlipper]) {
      const tipX = f.px + Math.cos(f.angle) * f.len;
      const tipY = f.py + Math.sin(f.angle) * f.len;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = f.half * 2;
      ctx.strokeStyle = f.pressed ? "#ffe9a8" : "#2a9d8f";
      ctx.beginPath();
      ctx.moveTo(f.px, f.py);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.lineWidth = f.half * 2 - 4;
      ctx.strokeStyle = "#1f3a5f";
      ctx.beginPath();
      ctx.moveTo(f.px, f.py);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(f.px, f.py, f.half + 2, 0, Math.PI * 2);
      ctx.fillStyle = "#c9c2b4";
      ctx.fill();
      ctx.restore();
    }
  }

  private drawBall(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.ball;
    const grad = ctx.createRadialGradient(x - 3, y - 4, 1, x, y, BALL_R);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.5, "#d8dde6");
    grad.addColorStop(1, "#6f7684");
    ctx.beginPath();
    ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.stroke();
  }

  private drawEvents(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = "center";
    for (const e of this.events) {
      const alpha = 1 - e.life / 1.1;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#1f3a5f";
      ctx.font = "bold 13px Georgia, serif";
      ctx.fillText(`+${e.points}`, e.x, e.y - e.life * 26);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "left";
  }
}
