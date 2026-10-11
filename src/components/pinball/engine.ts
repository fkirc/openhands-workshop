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
  kind: "wall" | "sling" | "guide";
  /** Flash intensity 0..1 for the slingshots. */
  lit: number;
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

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  hue: number;
}

const SPARK_COLORS = [45, 12, 175, 205, 320];

export class PinballEngine {
  state: GameState = "idle";
  score = 0;
  ballsLeft = 3;
  highScore = 0;

  readonly ball: Vec = { x: BOARD_W / 2, y: 120 };
  private vel: Vec = { x: 0, y: 0 };
  private prevBall: Vec = { x: BOARD_W / 2, y: 120 };
  private segments: Segment[] = [];
  private bumpers: Bumper[] = [];
  private targets: DropTarget[] = [];
  private posts: Bumper[] = [];
  private leftFlipper: Flipper;
  private rightFlipper: Flipper;
  private events: ScoreEvent[] = [];
  private sparks: Spark[] = [];
  private targetCombo = 0;
  private shake = 0;
  private time = 0;
  private lampPhase = 0;
  /** Pins the ball was last in contact with, to avoid repeat hits. */
  private touching = new Set<Bumper>();

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
    return { ax, ay, bx, by, restitution, kick: 0, kind: "wall", lit: 0 };
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
      { ax: 30, ay: 120, bx: 120, by: 96, restitution: 0.4, kick: 0, kind: "guide", lit: 0 },
      { ax: BOARD_W - 30, ay: 120, bx: BOARD_W - 120, by: 96, restitution: 0.4, kick: 0, kind: "guide", lit: 0 },

      // Slanted chrome rails that lead onto the flippers. Each rail ends at
      // its flipper pivot and shares the flipper's rest angle, so the ball
      // rolls smoothly from the rail onto the flipper with no wedge.
      { ax: w, ay: 500, bx: 146, by: 656, restitution: 0.35, kick: 0, kind: "guide", lit: 0 },
      { ax: BOARD_W - w, ay: 500, bx: BOARD_W - 146, by: 656, restitution: 0.35, kick: 0, kind: "guide", lit: 0 },

      // Slingshots.
      { ax: 60, ay: 430, bx: 150, by: 520, restitution: 0.5, kick: 320, kind: "sling", lit: 0 },
      { ax: BOARD_W - 60, ay: 430, bx: BOARD_W - 150, by: 520, restitution: 0.5, kick: 320, kind: "sling", lit: 0 },
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
    this.sparks = [];
    this.touching.clear();
    for (const t of this.targets) t.down = false;
    for (const t of this.targets) t.lit = 0;
    for (const s of this.segments) s.lit = 0;
    this.launchBall();
  }

  private launchBall() {
    this.ball.x = BOARD_W / 2 + (Math.random() - 0.5) * 30;
    this.ball.y = 120;
    this.prevBall.x = this.ball.x;
    this.prevBall.y = this.ball.y;
    this.vel.x = (Math.random() - 0.5) * 120;
    this.vel.y = 60;
    this.shake = 0;
    this.touching.clear();
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

  /** Emits a short-lived burst of enamel-coloured sparks. */
  private burst(x: number, y: number, count: number, speed = 260) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const power = speed * (0.35 + Math.random() * 0.65);
      const max = 0.3 + Math.random() * 0.35;
      this.sparks.push({
        x,
        y,
        vx: Math.cos(angle) * power,
        vy: Math.sin(angle) * power,
        life: max,
        max,
        hue: SPARK_COLORS[(Math.random() * SPARK_COLORS.length) | 0],
      });
    }
    if (this.sparks.length > 320) this.sparks.splice(0, this.sparks.length - 320);
  }

  // ------------------------------------------------------------------ physics

  step(dt: number) {
    const clamped = clamp(dt, 0, 1 / 30);
    const h = clamped / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) this.substep(h);
    for (const b of this.bumpers) b.lit = Math.max(0, b.lit - clamped * 3);
    for (const p of this.posts) p.lit = Math.max(0, p.lit - clamped * 3);
    for (const t of this.targets) t.lit = Math.max(0, t.lit - clamped * 3);
    for (const s of this.segments) s.lit = Math.max(0, s.lit - clamped * 3);
    for (const e of this.events) e.life += clamped;
    this.events = this.events.filter((e) => e.life < 1.1);
    this.shake = Math.max(0, this.shake - clamped * 2);
    this.time += clamped;
    this.lampPhase += clamped;
    for (const s of this.sparks) {
      s.life -= clamped;
      s.x += s.vx * clamped;
      s.y += s.vy * clamped;
      s.vy += GRAVITY * 0.55 * clamped;
      s.vx *= 1 - 1.6 * clamped;
    }
    this.sparks = this.sparks.filter((s) => s.life > 0);
  }

  private substep(h: number) {
    this.updateFlippers(h);
    if (this.state !== "playing") return;

    this.prevBall.x = this.ball.x;
    this.prevBall.y = this.ball.y;

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
      this.burst(cx, cy, 7, 240);
      s.lit = 1;
      this.shake = Math.min(1, this.shake + 0.4);
    }
  }

  private collideBumper(b: Bumper) {
    const ball = this.ball;
    let nx = ball.x - b.x;
    let ny = ball.y - b.y;
    let dist = Math.hypot(nx, ny);
    const min = BALL_R + b.r;
    if (dist >= min) {
      this.touching.delete(b);
      return;
    }
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
    // Only score and flash on first contact, not while resting against it.
    if (!this.touching.has(b)) {
      this.touching.add(b);
      this.vel.x += nx * 120;
      this.vel.y += ny * 120;
      b.lit = 1;
      this.burst(b.x, b.y, b.score >= 100 ? 12 : 6, b.score >= 100 ? 320 : 200);
      this.award(b.score, b.score >= 100 ? "BUMPER" : "POST", b.x, b.y);
    }
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
    this.burst(t.x + t.w / 2, t.y, 9, 220);
    this.award(500, "TARGET", t.x + t.w / 2, t.y);
    if (this.targets.every((x) => x.down)) {
      this.targetCombo += 1;
      this.award(5000 * this.targetCombo, "ALL TARGETS!", BOARD_W / 2, 150);
      this.burst(BOARD_W / 2, 130, 26, 420);
      this.shake = Math.min(1, this.shake + 0.8);
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

  /**
   * Fifties look: a chrome cabinet rail, a cream playfield with printed
   * decals and illuminated lanes, warm enamel fixtures and steel hardware.
   */
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
    ctx.save();
    this.roundRect(ctx, 0, 0, BOARD_W, BOARD_H, 18);
    ctx.clip();

    this.drawPlayfield(ctx);
    this.drawLaneLamps(ctx);
    this.drawPlungerLane(ctx);
    this.drawApron(ctx);
    this.drawSlingshots(ctx);
    this.drawGuides(ctx);
    this.drawCabinet(ctx);
    this.drawBumpers(ctx);
    this.drawPosts(ctx);
    this.drawTargets(ctx);
    this.drawFlippers(ctx);
    this.drawSparks(ctx);
    if (this.state === "playing") this.drawBall(ctx);
    this.drawEvents(ctx);

    ctx.restore();
    this.drawFrame(ctx);
    ctx.restore();
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private drawPlayfield(ctx: CanvasRenderingContext2D) {
    const bg = ctx.createLinearGradient(0, 0, 0, BOARD_H);
    bg.addColorStop(0, "#f7edd3");
    bg.addColorStop(0.45, "#efe0bb");
    bg.addColorStop(1, "#dcc79a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);

    // Faint starburst behind the pop bumpers.
    ctx.save();
    ctx.translate(BOARD_W / 2, 250);
    ctx.strokeStyle = "rgba(193,39,45,0.10)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 16; i++) {
      ctx.rotate((Math.PI * 2) / 16);
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.lineTo(0, 210);
      ctx.stroke();
    }
    ctx.restore();

    // Printed arcs, a hallmark of fifties playfields.
    ctx.lineCap = "round";
    const arcColors = ["#c1272d", "#e9b44c", "#2a9d8f"];
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = arcColors[i];
      ctx.globalAlpha = 0.4;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(BOARD_W / 2, 258, 96 + i * 30, Math.PI * 0.08, Math.PI * 0.92);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Bunting-style swags across the lower playfield.
    ctx.strokeStyle = "rgba(31,58,95,0.35)";
    ctx.lineWidth = 3;
    for (let row = 0; row < 2; row++) {
      const y = 400 + row * 34;
      for (let i = 0; i < 3; i++) {
        const cx = BOARD_W / 2 + (i - 1) * 130;
        ctx.beginPath();
        ctx.moveTo(cx - 65, y);
        ctx.quadraticCurveTo(cx, y + 30, cx + 65, y);
        ctx.stroke();
      }
    }

    // Big printed title in the drain area.
    ctx.save();
    ctx.textAlign = "center";
    ctx.font = "bold 30px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "rgba(31,58,95,0.16)";
    ctx.fillText("FIFTIES", BOARD_W / 2 + 2, 566);
    ctx.fillText("FLIPPER", BOARD_W / 2 + 2, 596);
    ctx.fillStyle = "#c1272d";
    ctx.globalAlpha = 0.55;
    ctx.fillText("FIFTIES", BOARD_W / 2, 564);
    ctx.fillText("FLIPPER", BOARD_W / 2, 594);
    ctx.globalAlpha = 0.45;
    ctx.font = "italic 13px Georgia, 'Times New Roman', serif";
    ctx.fillStyle = "#1f3a5f";
    ctx.fillText("insert coin  •  play ball", BOARD_W / 2, 616);
    ctx.restore();

    // Little enamel dots scattered like nail heads.
    ctx.fillStyle = "rgba(31,58,95,0.12)";
    for (let i = 0; i < 26; i++) {
      const x = 40 + ((i * 97) % (BOARD_W - 80));
      const y = 140 + ((i * 53) % 430);
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawLaneLamps(ctx: CanvasRenderingContext2D) {
    // A row of alternating bulbs that animate while the machine is idle.
    const count = 9;
    for (let i = 0; i < count; i++) {
      const x = 96 + (i * (BOARD_W - 192)) / (count - 1);
      const y = 168;
      const phase = this.lampPhase * 4 - i * 0.6;
      const pulse = this.state === "playing" ? 0.45 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(phase));
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#c1272d" : "#e9b44c";
      ctx.globalAlpha = pulse;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(31,58,95,0.6)";
      ctx.stroke();
      // Warm halo.
      const halo = ctx.createRadialGradient(x, y, 1, x, y, 18);
      halo.addColorStop(0, `rgba(255,217,135,${0.5 * pulse})`);
      halo.addColorStop(1, "rgba(255,217,135,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawPlungerLane(ctx: CanvasRenderingContext2D) {
    // Chrome ball-return lane in the top-right corner.
    const laneX = BOARD_W - 58;
    ctx.save();
    ctx.strokeStyle = "rgba(31,58,95,0.55)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(laneX, 24);
    ctx.lineTo(laneX, 150);
    ctx.stroke();

    // Chrome gradient along the lane.
    const chrome = ctx.createLinearGradient(laneX, 0, BOARD_W, 0);
    chrome.addColorStop(0, "rgba(255,255,255,0.5)");
    chrome.addColorStop(0.5, "rgba(120,128,140,0.35)");
    chrome.addColorStop(1, "rgba(255,255,255,0.55)");
    ctx.fillStyle = chrome;
    ctx.fillRect(laneX, 24, BOARD_W - laneX - 6, 126);

    ctx.fillStyle = "rgba(31,58,95,0.5)";
    ctx.font = "bold 9px Georgia, serif";
    ctx.save();
    ctx.translate(laneX + 26, 118);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "left";
    ctx.fillText("BALL RETURN", 0, 0);
    ctx.restore();
    ctx.restore();
  }

  private drawApron(ctx: CanvasRenderingContext2D) {
    // The decorated apron covering the out-lane area.
    ctx.save();
    const grad = ctx.createLinearGradient(0, 700, 0, BOARD_H);
    grad.addColorStop(0, "#c1272d");
    grad.addColorStop(1, "#8f1b1f");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 700);
    ctx.lineTo(BOARD_W, 700);
    ctx.lineTo(BOARD_W, BOARD_H);
    ctx.lineTo(0, BOARD_H);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#e9b44c";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 706);
    ctx.lineTo(BOARD_W, 706);
    ctx.stroke();

    // Chrome instruction card.
    ctx.fillStyle = "#f4e8c9";
    this.roundRect(ctx, 132, 716, 176, 34, 6);
    ctx.fill();
    ctx.strokeStyle = "#e9b44c";
    ctx.lineWidth = 2;
    this.roundRect(ctx, 132, 716, 176, 34, 6);
    ctx.stroke();
    ctx.fillStyle = "#1f3a5f";
    ctx.textAlign = "center";
    ctx.font = "bold 11px Georgia, serif";
    ctx.fillText("PLAY BALL", BOARD_W / 2, 731);
    ctx.font = "9px Georgia, serif";
    ctx.fillText("Z / M  ·  ← / →", BOARD_W / 2, 744);
    ctx.restore();
  }

  private drawGuides(ctx: CanvasRenderingContext2D) {
    for (const s of this.segments) {
      if (s.kind !== "guide") continue;
      ctx.save();
      ctx.lineCap = "round";
      // Outer dark edge.
      ctx.strokeStyle = "#8b8f98";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.stroke();
      // Polished metal face.
      ctx.strokeStyle = "#d8dde6";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawCabinet(ctx: CanvasRenderingContext2D) {
    // Chrome side rails and top arch, drawn over the playfield edges.
    ctx.save();
    ctx.lineCap = "round";
    const chrome = ctx.createLinearGradient(0, 0, 40, 0);
    chrome.addColorStop(0, "#f2f4f7");
    chrome.addColorStop(0.5, "#a9b0bb");
    chrome.addColorStop(1, "#6f7684");

    ctx.strokeStyle = chrome;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(6, 40);
    ctx.lineTo(6, BOARD_H - 6);
    ctx.moveTo(BOARD_W - 6, 40);
    ctx.lineTo(BOARD_W - 6, BOARD_H - 6);
    ctx.stroke();

    // Inner highlight line.
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, 60);
    ctx.lineTo(11, BOARD_H - 20);
    ctx.moveTo(BOARD_W - 11, 60);
    ctx.lineTo(BOARD_W - 11, BOARD_H - 20);
    ctx.stroke();
    ctx.restore();
  }

  private drawTargets(ctx: CanvasRenderingContext2D) {
    for (const t of this.targets) {
      ctx.save();
      if (t.down) {
        ctx.fillStyle = "rgba(31,58,95,0.12)";
        this.roundRect(ctx, t.x, t.y, t.w, t.h, 3);
        ctx.fill();
      } else {
        const grad = ctx.createLinearGradient(0, t.y, 0, t.y + t.h);
        grad.addColorStop(0, t.lit > 0 ? "#fff2c4" : "#e14a4f");
        grad.addColorStop(1, t.lit > 0 ? "#ffd987" : "#a81f24");
        ctx.fillStyle = grad;
        this.roundRect(ctx, t.x, t.y, t.w, t.h, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        this.roundRect(ctx, t.x + 3, t.y + 2, t.w - 6, 3, 1.5);
        ctx.fill();
        ctx.fillStyle = "#fff4d6";
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
      const flash = s.lit;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.lineTo(s.ax, s.by);
      ctx.closePath();
      const grad = ctx.createLinearGradient(s.ax, s.ay, s.bx, s.by);
      grad.addColorStop(0, flash > 0 ? "#fff2c4" : "#f0c46a");
      grad.addColorStop(1, flash > 0 ? "#ffd987" : "#d99a2b");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#1f3a5f";
      ctx.stroke();

      // Rubber band along the striking face.
      ctx.beginPath();
      ctx.moveTo(s.ax, s.ay);
      ctx.lineTo(s.bx, s.by);
      ctx.strokeStyle = flash > 0 ? "#ffffff" : "#2a9d8f";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = "rgba(31,58,95,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawBumpers(ctx: CanvasRenderingContext2D) {
    for (const b of this.bumpers) {
      const glow = b.lit;
      // Halo.
      const halo = ctx.createRadialGradient(b.x, b.y, b.r * 0.5, b.x, b.y, b.r + 22);
      halo.addColorStop(0, `rgba(255,217,135,${0.25 + glow * 0.55})`);
      halo.addColorStop(1, "rgba(255,217,135,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r + 22, 0, Math.PI * 2);
      ctx.fill();

      // Skirt.
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      const skirt = ctx.createRadialGradient(b.x - 6, b.y - 6, 2, b.x, b.y, b.r);
      skirt.addColorStop(0, glow > 0 ? "#fff6d8" : "#e14a4f");
      skirt.addColorStop(1, glow > 0 ? "#ffd987" : "#8f1b1f");
      ctx.fillStyle = skirt;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#5f1216";
      ctx.stroke();

      // Cap with a metallic ring and a bright core.
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.55, 0, Math.PI * 2);
      const cap = ctx.createRadialGradient(b.x - 3, b.y - 3, 1, b.x, b.y, b.r * 0.55);
      cap.addColorStop(0, "#ffffff");
      cap.addColorStop(1, glow > 0 ? "#ffd987" : "#e9b44c");
      ctx.fillStyle = cap;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#1f3a5f";
      ctx.stroke();

      // Star burst rays when lit.
      if (glow > 0) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.globalAlpha = glow * 0.8;
        ctx.strokeStyle = "#fff6d8";
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          ctx.rotate(Math.PI / 4);
          ctx.beginPath();
          ctx.moveTo(b.r + 2, 0);
          ctx.lineTo(b.r + 8 + glow * 6, 0);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  private drawPosts(ctx: CanvasRenderingContext2D) {
    for (const p of this.posts) {
      const lit = p.lit;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(31,58,95,0.25)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(p.x - 3, p.y - 3, 1, p.x, p.y, p.r);
      grad.addColorStop(0, lit > 0 ? "#ffffff" : "#57c3b6");
      grad.addColorStop(1, lit > 0 ? "#ffd987" : "#1c6f66");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#123f3a";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();
    }
  }

  private drawFlippers(ctx: CanvasRenderingContext2D) {
    for (const f of [this.leftFlipper, this.rightFlipper]) {
      const tipX = f.px + Math.cos(f.angle) * f.len;
      const tipY = f.py + Math.sin(f.angle) * f.len;
      const grad = ctx.createLinearGradient(f.px, f.py, tipX, tipY);
      grad.addColorStop(0, f.pressed ? "#fff2c4" : "#3fc0b1");
      grad.addColorStop(0.5, f.pressed ? "#ffd987" : "#2a9d8f");
      grad.addColorStop(1, f.pressed ? "#e9b44c" : "#1c6f66");

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = f.half * 2;
      ctx.strokeStyle = "#123f3a";
      ctx.beginPath();
      ctx.moveTo(f.px, f.py);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      ctx.lineWidth = f.half * 2 - 3;
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(f.px, f.py);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();

      // Glossy highlight along the top of the bat.
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.moveTo(f.px + Math.cos(f.angle) * 6, f.py + Math.sin(f.angle) * 6 - 2);
      ctx.lineTo(tipX - Math.cos(f.angle) * 8, tipY - Math.sin(f.angle) * 8 - 2);
      ctx.stroke();

      // Chrome pivot cap.
      ctx.beginPath();
      ctx.arc(f.px, f.py, f.half + 3, 0, Math.PI * 2);
      const cap = ctx.createRadialGradient(f.px - 2, f.py - 2, 1, f.px, f.py, f.half + 3);
      cap.addColorStop(0, "#ffffff");
      cap.addColorStop(1, "#8b8f98");
      ctx.fillStyle = cap;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#4b4f57";
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawSparks(ctx: CanvasRenderingContext2D) {
    if (this.sparks.length === 0) return;
    ctx.save();
    for (const s of this.sparks) {
      const t = s.life / s.max;
      ctx.globalAlpha = Math.max(0, t);
      ctx.fillStyle = `hsl(${s.hue} 90% 60%)`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.5 + t * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawBall(ctx: CanvasRenderingContext2D) {
    const { x, y } = this.ball;
    // Motion trail.
    ctx.save();
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const tx = this.ball.x + (this.prevBall.x - this.ball.x) * t * 2;
      const ty = this.ball.y + (this.prevBall.y - this.ball.y) * t * 2;
      ctx.globalAlpha = 0.18 * (1 - t);
      ctx.fillStyle = "#f4e8c9";
      ctx.beginPath();
      ctx.arc(tx, ty, BALL_R * (1 - t * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Steel sphere with a warm enamel reflection.
    const grad = ctx.createRadialGradient(x - 3.5, y - 4.5, 1, x, y, BALL_R);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#e6ebf2");
    grad.addColorStop(0.75, "#9aa2af");
    grad.addColorStop(1, "#5a6270");
    ctx.beginPath();
    ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(20,20,25,0.5)";
    ctx.stroke();

    // Specular dot.
    ctx.beginPath();
    ctx.arc(x - BALL_R * 0.35, y - BALL_R * 0.4, BALL_R * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();
  }

  private drawEvents(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = "center";
    for (const e of this.events) {
      const alpha = 1 - e.life / 1.1;
      const y = e.y - e.life * 26;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = "bold 14px Georgia, serif";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(244,232,201,0.9)";
      ctx.strokeText(`+${e.points}`, e.x, y);
      ctx.fillStyle = "#1f3a5f";
      ctx.fillText(`+${e.points}`, e.x, y);
      ctx.restore();
    }
    ctx.textAlign = "left";
  }

  private drawFrame(ctx: CanvasRenderingContext2D) {
    // Polished chrome bezel around the whole playfield.
    const grad = ctx.createLinearGradient(0, 0, BOARD_W, BOARD_H);
    grad.addColorStop(0, "#f4f6f9");
    grad.addColorStop(0.35, "#b9c0ca");
    grad.addColorStop(0.6, "#7f8792");
    grad.addColorStop(1, "#e8ecf1");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    this.roundRect(ctx, 3, 3, BOARD_W - 6, BOARD_H - 6, 16);
    ctx.stroke();
    ctx.strokeStyle = "rgba(31,58,95,0.45)";
    ctx.lineWidth = 1.5;
    this.roundRect(ctx, 0.75, 0.75, BOARD_W - 1.5, BOARD_H - 1.5, 18);
    ctx.stroke();
  }
}
