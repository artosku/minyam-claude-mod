// Minyam walks, meets an enemy and fights it for as long as the task lasts: slashes, combos,
// skills and an ultimate, while the enemy evolves and grows. One enemy falls for each task done.
// Small pixel art seen from the side, Minyam on the left facing right. Two pixels per cell.

export type Cells = ReadonlyArray<ReadonlyArray<readonly [string | null, string | null]>>

export type Fx = { name: 'cross' | 'wave' | 'finish' | 'ulti'; t: number }

export type Scene = {
  st: 'idle' | 'walk' | 'fight' | 'die'
  t: number // ticks in the state
  ex: number | null // the enemy's left edge, null while there is none
  kills: number
  pending: number // tasks done whose enemy is still to be cut down
  scroll: number
  step: number
  ft: number // ticks of this fight
  combo: number
  pose: 'stance' | 'windup' | 'swing'
  fx: Fx | null
  flash: boolean // the enemy was just hit
  finishing: boolean // the last blow is on its way
  hp: number // 0..1, what the bar over the enemy shows
  pets: Pet[] // helpers that appear while a sub agent works
  beres: boolean // the work is done and the last enemy fell: BERES stays on the stage until the next task
  gh: boolean // a GitHub task (push, pull, gh ...): other monster, and Minyam shoots
  mail?: { dir: 'out' | 'in'; t: number } | null // a letter: thrown out when a message is sent, dropped in when one arrives
}

export type PetKind = 'haiku' | 'sonnet' | 'opus'
export type Pet = { id: string; k: PetKind; t: number }

export const newScene = (): Scene => ({
  st: 'idle', t: 0, ex: null, kills: 0, pending: 0, scroll: 0, step: 0,
  ft: 0, combo: 0, pose: 'stance', fx: null, flash: false, finishing: false, hp: 1, pets: [], gh: false, beres: false, mail: null,
})

const PH = 26 // pixel rows: 13 cell rows
const GROUND = 21 // first ground row
const OX = 2 // Minyam's left edge
const OY = GROUND - 14 // his sprite is 14 rows high and stands on the ground

const PAL: Record<string, string> = {
  c: '#fff0c8', s: '#efd196', r: '#f0434f', p: '#ee4f9a', t: '#2fc9b8', y: '#f7a823',
  e: '#2d1b12', k: '#fba4b8', f: '#f59a1f',
  g: '#7ee07e', G: '#3fa84a', b: '#5aa0ff', B: '#2f66c8', w: '#ffffff',
  u: '#a06bff', U: '#5c2fb5', o: '#ffd02e', z: '#9aa5b5',
}

// The helpers: Haiku a small green bird, Sonnet a blue owl, Opus a purple-gold dragon.
const PETS: Record<PetKind, { art: string[]; period: number; dmg: number; y: number; label: string }> = {
  haiku: { art: ['..ggg..', 'Gggggey', 'GGgggg.', '.ggggg.', '..y.y..'], period: 4, dmg: 1, y: 1, label: 'Haiku' },
  sonnet: { art: ['.B....B.', '.BbbbbB.', '.bwebwe.', 'BbbbyybB', 'BbbBBbbB', '.BbbbbB.', '..y..y..'], period: 6, dmg: 2, y: 0, label: 'Sonnet' },
  opus: { art: ['.....o.o...', 'U...uuuuuu.', 'UU.uuuuueuy', '.UUuuuuuuyy', '..uuuuuuu..', '.Uuuooouu..', '.UuuuuuuU..', '..u.u.u.u..'], period: 10, dmg: 4, y: 0, label: 'Opus' },
}
export const petLabel = (k: PetKind) => PETS[k].label
export function addPet(sc: Scene, id: string, k: PetKind) {
  if (sc.pets.length < 3) sc.pets.push({ id, k, t: 0 })
}
// Pets whose sub agent is no longer running go away (a young pet gets a moment to show up in the list).
export function syncPets(sc: Scene, live: ReadonlySet<string>): boolean {
  const keep = sc.pets.filter(p => live.has(p.id) || p.t < 12)
  if (keep.length === sc.pets.length) return false
  sc.pets = keep
  return true
}
export function removePet(sc: Scene, id: string) {
  sc.pets = sc.pets.filter(p => p.id !== id)
}
const petX = (i: number) => 1 + i * 10

// Minyam from the side, facing right: comb, a teal wing, a pink tail, the beak on the right.
const BODY = [
  '.....rr.rr.....',
  '....rrrrrrr....',
  '...ccccccccc...',
  'p.ccccccccccc..',
  'ppcccccccceccc.',
  'ppcccccccceccyy',
  'pccccccccccccyy',
  '.cccttttcccckc.',
  '.ccttttttccccc.',
  '.cccttttcccccc.',
  '..ccccccccccc..',
  '...sssssssss...',
  '....ssssss.....',
]
const FEET = {
  stand: '....ff...ff....',
  a: '...ff.....ff...',
  b: '.....ff.ff.....',
}

// The enemy grows the longer the task lasts: slime, horned slime, ogre, dragon.
const MON = [
  { w: 10, h: 8, c: '#59c25b', d: '#2f7d32', hi: '#8be28b', horn: 0, name: 'Slime' },
  { w: 14, h: 10, c: '#4aa3df', d: '#2a6a9c', hi: '#8fd0ff', horn: 2, name: 'Slime Tanduk' },
  { w: 18, h: 13, c: '#9b59b6', d: '#5e3370', hi: '#c792ea', horn: 3, name: 'Ogre' },
  { w: 22, h: 16, c: '#e04a3a', d: '#8c2418', hi: '#ff8f7a', horn: 4, name: 'Naga' },
]
const OCTO_NAMES = ['Anak Gurita', 'Gurita Kode', 'Gurita Raksasa', 'Kraken Merge']
export const monsterName = (stage: number, gh = false) => (gh ? OCTO_NAMES : MON.map(m => m.name))[Math.max(0, Math.min(3, stage))]
export const stageOf = (ft: number) => (ft >= 90 ? 3 : ft >= 36 ? 2 : ft >= 14 ? 1 : 0)
export const enemyWidth = (stage: number) => MON[stage].w
export const fightX = (w: number) => Math.max(14, Math.min(19, w - 24))
export const fxLabel = (fx: Fx | null, gh = false) =>
  fx == null
    ? ''
    : fx.name === 'cross'
      ? gh ? 'Tembakan Silang' : 'Tebasan Silang'
      : fx.name === 'wave'
        ? gh ? 'Peluru Angin' : 'Gelombang Angin'
        : fx.name === 'finish'
          ? gh ? 'Tembakan Akhir' : 'Tebasan Akhir'
          : 'ULTIMATE: Meteor Emas'

const FX_LEN = { cross: 2, wave: 3, finish: 2, ulti: 4 }

type Buf = (string | null)[][]

function put(buf: Buf, x: number, y: number, c: string | null) {
  if (c && y >= 0 && y < buf.length && x >= 0 && x < buf[0].length) buf[y][x] = c
}

function sprite(buf: Buf, rows: string[], x: number, y: number) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]
      if (ch !== '.') put(buf, x + i, y + j, PAL[ch] ?? null)
    }
  })
}

export function tickScene(sc: Scene, working: boolean, w: number): boolean {
  const before = JSON.stringify(sc)
  sc.step += 1
  sc.flash = false
  for (const p of sc.pets ?? []) p.t += 1
  if (sc.mail) {
    sc.mail.t += 1
    if (sc.mail.dir === 'out' ? OX + 3 + sc.mail.t * 3 >= w + 8 || sc.mail.t > 60 : sc.mail.t >= 36) sc.mail = null
  }
  const spawn = () => { sc.ex = w - MON[0].w; sc.ft = 0; sc.combo = 0; sc.fx = null; sc.pose = 'stance'; sc.finishing = false; sc.hp = 1; sc.gh = false; sc.beres = false }
  const after = () => {
    sc.ex = null
    sc.t = 0
    if (working || sc.pending > 0) { spawn(); sc.st = 'walk' } else { sc.st = 'idle'; sc.beres = true }
  }
  switch (sc.st) {
    case 'idle':
      if (working) { spawn(); sc.st = 'walk' } else if (!sc.beres) sc.step = 0
      else if (sc.step > 40) sc.step = 40 // BERES sparkles for a few seconds, then holds still
      break
    case 'walk':
      sc.scroll += 1
      if (sc.ex == null) spawn()
      else sc.ex -= 2 + Math.max(0, Math.floor((w - 54) / 40)) // a wider stage is crossed faster
      if ((sc.ex ?? 0) <= fightX(w)) { sc.ex = fightX(w); sc.st = 'fight'; sc.t = 0; sc.ft = 0 }
      break
    case 'fight': {
      sc.ft += 1
      for (const p of sc.pets) {
        const pt = PETS[p.k]
        if (!sc.finishing && p.t % pt.period === 3) { sc.flash = true; sc.combo += pt.dmg }
      }
      sc.hp = sc.finishing ? Math.max(0, sc.hp - 0.4) : Math.max(0.1, 1 - sc.combo * 0.04)
      if (sc.fx) {
        sc.fx.t += 1
        if (sc.fx.name !== 'ulti' || sc.fx.t >= 1) sc.flash = sc.fx.name !== 'wave' || sc.fx.t >= 2
        if (sc.fx.t >= FX_LEN[sc.fx.name]) {
          const was = sc.fx
          sc.fx = null
          if (sc.finishing && (was.name === 'finish' || was.name === 'ulti')) { sc.st = 'die'; sc.t = 0; sc.hp = 0 }
        }
        break
      }
      if (sc.pending > 0 && !sc.finishing) {
        // the task is done: a heavy blow, or the ultimate once the enemy has grown
        sc.finishing = true
        sc.pose = 'swing'
        sc.fx = { name: stageOf(sc.ft) >= 2 ? 'ulti' : 'finish', t: 0 }
        break
      }
      const phase = sc.ft % 3
      if (phase === 1) {
        sc.pose = 'windup'
      } else if (phase === 2) {
        sc.pose = 'swing'
        sc.flash = true
        sc.combo += 1
        if (sc.ft >= 90 && sc.combo % 20 === 0) sc.fx = { name: 'ulti', t: 0 }
        else if (sc.combo % 12 === 0) sc.fx = { name: 'wave', t: 0 }
        else if (sc.combo % 5 === 0) sc.fx = { name: 'cross', t: 0 }
      } else {
        sc.pose = 'stance'
      }
      break
    }
    case 'die':
      sc.t += 1
      if (sc.t >= 3) {
        sc.kills += 1
        sc.pending = Math.max(0, sc.pending - 1)
        after()
      }
      break
  }
  return JSON.stringify(sc) !== before
}

// The GitHub monsters, each its own design: a cute baby, a terminal octopus with an antenna,
// a spiked ogre-octopus with fangs and a Kraken that wears the merge symbol and a crown.
const OCTO = [
  { c: '#b9a3ff', d: '#6d57b8', hi: '#efe9ff', eye: '#ffffff' },
  { c: '#2cc4d6', d: '#16727f', hi: '#b4f4fb', eye: '#7cff9a' },
  { c: '#4b3f9e', d: '#251d5a', hi: '#9a8cf0', eye: '#ff5a5a' },
  { c: '#c2255c', d: '#4a0b25', hi: '#ff94b0', eye: '#ffe14d' },
]

function drawOcto(buf: Buf, x: number, y: number, stage: number, tint: string | null, step: number) {
  const m = MON[stage]
  const o = OCTO[stage]
  const col = (c: string) => tint ?? c
  const headH = Math.round(m.h * 0.62)
  const cx = x + Math.floor(m.w / 2)

  // the head
  for (let j = 0; j < headH; j++) {
    for (let i = 0; i < m.w; i++) {
      const nx = (i + 0.5 - m.w / 2) / (m.w / 2)
      const ny = (j + 0.5 - headH) / headH
      if (nx * nx + ny * ny > 1) continue
      put(buf, x + i, y + j, col(nx > 0.7 || j >= headH - 1 ? o.d : nx < -0.3 && ny < -0.5 ? o.hi : o.c))
    }
  }

  // the tentacles: few and small, then many with suckers, then thick and long
  const gap = stage === 0 ? 3 : stage === 3 ? 4 : 2
  const tw = stage === 3 ? 2 : 1
  for (let i = 1; i < m.w - tw + 1; i += gap) {
    for (let j = headH - 1; j < m.h; j++) {
      const amp = stage === 3 ? 0.5 : 0.35
      const sway = Math.round(Math.sin((step + i + j) * 0.9) * (j - headH + 2) * amp)
      for (let t = 0; t < tw; t++) put(buf, x + i + t + sway, y + j, col(j >= m.h - 2 ? o.d : o.c))
      if (stage === 2 && j > headH && (j - headH) % 2 === 0) put(buf, x + i + sway, y + j, col(o.hi))
    }
  }

  const eyeXs = [x + Math.round(m.w * 0.2), x + Math.round(m.w * 0.58)]
  const eyeY = y + Math.round(headH * 0.4)

  if (stage === 0) {
    // big wet eyes and a blush: harmless
    for (const xe of eyeXs) {
      for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) put(buf, xe + i, eyeY + j, col(o.eye))
      put(buf, xe + 1, eyeY + 1, col('#2d1b12'))
      put(buf, xe + 1, eyeY + 2, col('#2d1b12'))
    }
    put(buf, x + 1, eyeY + 4, col('#ff9ec7'))
    put(buf, x + m.w - 3, eyeY + 4, col('#ff9ec7'))
  } else if (stage === 1) {
    // an antenna with a blinking tip, square terminal eyes and < > on the forehead
    for (let j = 1; j <= 3; j++) put(buf, cx, y - j + 1, col(o.d))
    put(buf, cx, y - 3, col(step % 4 < 2 ? '#ffe14d' : '#ff9d2e'))
    for (const xe of eyeXs) {
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) put(buf, xe + i, eyeY + j, col(o.eye))
    }
    for (const [dx, dy] of [[-3, 0], [-4, 1], [-3, 2]]) put(buf, cx + dx, y + 1 + dy, col(o.d))
    for (const [dx, dy] of [[3, 0], [4, 1], [3, 2]]) put(buf, cx + dx, y + 1 + dy, col(o.d))
    for (let i = 0; i < 4; i++) put(buf, cx - 2 + i, y + headH - 2, col(o.d))
  } else if (stage === 2) {
    // spikes, red angry eyes with brows, and fangs
    for (let i = 2; i < m.w - 2; i += 3) {
      put(buf, x + i, y - 1, col('#ffb347'))
      put(buf, x + i, y, col('#ffb347'))
      put(buf, x + i + 1, y, col('#e8891d'))
    }
    for (let k = 0; k < eyeXs.length; k++) {
      const xe = eyeXs[k]
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) put(buf, xe + i, eyeY + j, col(o.eye))
      put(buf, xe + 1, eyeY + 1, col('#2d1b12'))
      for (let i = 0; i < 4; i++) put(buf, xe - 1 + i, eyeY - 1 - (k === 0 ? (i < 2 ? 1 : 0) : (i > 1 ? 1 : 0)), col(o.d))
    }
    const my = y + headH - 3
    for (let i = 0; i < 6; i++) put(buf, cx - 3 + i, my, col('#2d1b12'))
    for (const dx of [-3, 2]) { put(buf, cx + dx, my + 1, col('#ffffff')); put(buf, cx + dx, my + 2, col('#ffffff')) }
  } else {
    // the Kraken: a golden crown of horns, glowing slit eyes, the merge symbol and sparks
    for (const hx of [x + 3, cx - 1, x + m.w - 5]) {
      for (let r = 0; r < 5; r++) for (let i = 0; i <= (r < 2 ? 1 : 0); i++) put(buf, hx + i, y - 1 - r, col(r > 2 ? '#fff0a8' : '#ffe14d'))
    }
    for (const xe of eyeXs) {
      for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) put(buf, xe + i, eyeY + j, col(o.eye))
      for (let j = 0; j < 3; j++) put(buf, xe + 1, eyeY + j, col('#2d1b12'))
    }
    // merge symbol: two branches meeting in one
    const gy = y + Math.round(headH * 0.62)
    for (const [dx, dy] of [[-4, 0], [-3, 1], [-2, 2], [4, 0], [3, 1], [2, 2], [-1, 3], [0, 3], [1, 3], [0, 4]]) put(buf, cx + dx, gy + dy, col('#ffe14d'))
    for (const [dx, dy] of [[-4, -1], [4, -1], [0, 5]]) put(buf, cx + dx, gy + dy, col('#ffffff'))
    // sparks around it
    const sp = [[-2, -3], [m.w, 2], [-3, 6], [m.w + 1, 8], [m.w - 3, -4]]
    for (let k = 0; k < sp.length; k++) if ((step + k) % 3 === 0) put(buf, x + sp[k][0], y + sp[k][1], col('#ffe14d'))
  }
}

function drawMonster(buf: Buf, x: number, y: number, stage: number, tint: string | null) {
  const m = MON[stage]
  const col = (c: string) => tint ?? c
  if (stage === 3) {
    // wings behind the dragon
    for (let k = 0; k < 9; k++) for (let j = 0; j <= k; j++) put(buf, x + m.w - 7 + k - j / 2 | 0, y + 8 - k, col('#6b1a12'))
  }
  for (let j = 0; j < m.h; j++) {
    for (let i = 0; i < m.w; i++) {
      const nx = (i + 0.5 - m.w / 2) / (m.w / 2)
      const ny = (j + 0.5 - m.h) / m.h
      const inside = nx * nx + ny * ny <= 1 || j === m.h - 1 && Math.abs(nx) < 0.85
      if (!inside) continue
      const dark = j >= m.h - 2 || nx > 0.78
      const light = nx < -0.25 && ny < -0.55
      put(buf, x + i, y + j, col(dark ? m.d : light ? m.hi : m.c))
    }
  }
  const es = stage >= 2 ? 3 : stage >= 1 ? 2 : 1
  const ey = y + Math.round(m.h * 0.34)
  for (const xe of [x + Math.round(m.w * 0.22), x + Math.round(m.w * 0.6)]) {
    for (let j = 0; j < es; j++) for (let i = 0; i < es; i++) put(buf, xe + i, ey + j, tint ?? (stage === 3 ? '#ffd02e' : '#ffffff'))
    put(buf, xe, ey + es - 1, tint ? tint : '#2d1b12') // the pupil looks toward Minyam
    if (stage >= 1) for (let i = -1; i <= es; i++) put(buf, xe + i, ey - 1 - (i === es || i === es - 1 ? 0 : 0), tint ?? m.d)
  }
  const my = y + Math.round(m.h * 0.68)
  const mw = Math.max(2, Math.round(m.w * 0.4))
  const mx = x + Math.round(m.w * 0.5 - mw / 2)
  for (let i = 0; i < mw; i++) put(buf, mx + i, my, tint ?? '#2d1b12')
  if (stage >= 2) for (let i = 0; i < mw; i += 2) put(buf, mx + i, my, tint ?? '#ffffff')
  if (m.horn > 0) {
    for (const hx of [x + Math.round(m.w * 0.18), x + Math.round(m.w * 0.68)]) {
      for (let r = 0; r < m.horn; r++) {
        const half = Math.max(0, Math.ceil((m.horn - r) / 2) - 1)
        for (let i = -half; i <= half; i++) put(buf, hx + 1 + i, y + Math.round(m.h * 0.2) - r - 1, tint ?? '#f5f0d8')
      }
    }
  }
}

export function renderScene(w: number, sc: Scene): Cells {
  const buf: Buf = Array.from({ length: PH }, () => Array<string | null>(w).fill(null))

  // the ground slides left while he walks
  for (let x = 0; x < w; x++) {
    put(buf, x, GROUND, '#5aa03f')
    put(buf, x, GROUND + 1, '#4c8c3a')
    for (let y = GROUND + 2; y < PH; y++) put(buf, x, y, '#6b4a2f')
  }
  const slide = sc.scroll * 2
  for (let k = 0; k < 9; k++) {
    const x = (((k * 7 - slide) % w) + w) % w
    put(buf, x, GROUND - 1, '#5aa03f')
    put(buf, (x + 1) % w, GROUND, '#3f7a2f')
    put(buf, (((k * 11 - slide) % w) + w) % w, GROUND + 3, '#7d5a3a')
  }

  const pets = sc.pets ?? []
  pets.forEach((p, i) => {
    const pt = PETS[p.k]
    sprite(buf, pt.art, petX(i), pt.y + (sc.step % 4 < 2 ? 0 : 1))
  })

  const fighting = sc.st === 'fight'
  const stage = sc.st === 'fight' || sc.st === 'die' ? stageOf(sc.ft) : 0
  const m = MON[stage]
  const ex0 = sc.ex ?? 0
  const bx = OX + (sc.pose === 'swing' && fighting ? 1 : 0)
  const phase = sc.st === 'walk' ? sc.step % 4 : 1
  const feet = sc.st === 'walk' ? (phase === 0 ? FEET.a : phase === 2 ? FEET.b : FEET.stand) : FEET.stand
  const bob = (sc.st === 'walk' && phase % 2 === 1) || (fighting && sc.pose === 'stance' && sc.step % 2 === 0) ? -1 : 0
  const ey = GROUND - m.h
  const hit = sc.flash && fighting
  const ulti = sc.fx?.name === 'ulti'

  // BERES: the work is done, in big pixel letters on the stage
  if (sc.beres && sc.st === 'idle') {
    const word = 'BERES!'
    const GL: Record<string, string[]> = {
      B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
      E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
      R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
      S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
      '!': ['1', '1', '1', '1', '1', '0', '1'],
    }
    const total = word.split('').reduce((n, ch) => n + GL[ch][0].length + 1, -1)
    const x0 = Math.max(OX + 15, Math.min(w - total, 20))
    const y0 = 5
    const glow = sc.step % 8 < 4
    let cx0 = x0
    for (const ch of word) {
      const g = GL[ch]
      for (let j = 0; j < g.length; j++) {
        for (let i = 0; i < g[j].length; i++) {
          if (g[j][i] !== '1') continue
          put(buf, cx0 + i + 1, y0 + j + 1, '#8a5a2b')
        }
      }
      for (let j = 0; j < g.length; j++) {
        for (let i = 0; i < g[j].length; i++) {
          if (g[j][i] === '1') put(buf, cx0 + i, y0 + j, glow ? '#ffe14d' : '#ffd02e')
        }
      }
      cx0 += g[0].length + 1
    }
    // sparkles around it
    for (const [dx, dy, ph] of [[-2, -2, 0], [total + 1, 0, 2], [total / 2, -3, 4], [-3, 6, 6]] as const) {
      if ((sc.step + ph) % 8 < 4) put(buf, Math.round(x0 + dx), y0 + dy, '#ffffff')
    }
  }

  // LAGI / DIEM: nothing is happening and no BERES is up, so the stage says so in green pixel letters
  if (sc.st === 'idle' && !sc.beres && sc.ex == null && (sc.pets ?? []).length === 0) {
    const GI: Record<string, string[]> = {
      L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
      A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
      G: ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
      I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
      D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
      E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
      M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    }
    const lines = ['LAGI', 'DIEM']
    const wordW = (word: string) => word.split('').reduce((n, ch) => n + GI[ch][0].length + 1, -1)
    const widest = Math.max(...lines.map(wordW))
    const x0 = Math.max(OX + 15, Math.min(w - widest, 20))
    lines.forEach((word, row) => {
      let cx0 = x0
      const y0 = 1 + row * 8
      for (const ch of word) {
        const g = GI[ch]
        for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] === '1') put(buf, cx0 + i + 1, y0 + j + 1, '#2f6b2f')
        for (let j = 0; j < g.length; j++) for (let i = 0; i < g[j].length; i++) if (g[j][i] === '1') put(buf, cx0 + i, y0 + j, '#6bd66b')
        cx0 += g[0].length + 1
      }
    })
  }

  // the letter, high above the fight so it never covers the enemy: thrown to the right when a message goes out, hovering over Minyam's head when one comes in
  if (sc.mail) {
    const ENV = ['zzzzzzzz', 'zzwwwwzz', 'zwzwwzwz', 'zwwrrwwz', 'zwwwwwwz', 'zzzzzzzz']
    const t = sc.mail.t
    let mx: number
    let my: number
    if (sc.mail.dir === 'out') {
      mx = OX + 3 + t * 3
      my = 3 - Math.round(3 * Math.sin(Math.min(1, t / 12) * Math.PI))
    } else {
      mx = OX + 3
      my = Math.min(1, -6 + t * 2) + (t >= 8 ? (sc.step % 6 < 3 ? 0 : 1) : 0)
    }
    sprite(buf, sc.mail.dir === 'in' ? ENV.map(r => r.replace(/z/g, 'o')) : ENV, mx, my)
    if (sc.mail.dir === 'in' && t >= 10 && sc.step % 4 < 2) {
      put(buf, mx - 2, my - 1, '#ffffff')
      put(buf, mx + 9, my + 1, '#ffe14d')
      put(buf, mx + 4, my - 3, '#ffffff')
    }
  }

  // the enemy
  if (sc.ex != null) {
    const shake = hit ? (sc.step % 2 === 0 ? 1 : 0) : 0
    if (sc.st === 'die') {
      if (sc.t === 0) {
        // it collapses into a flat blob
        const flat = MON[stage]
        for (let i = 0; i < flat.w; i++) put(buf, ex0 + i, GROUND - 3 + (i % 2), '#9aa5a0')
        for (let i = 1; i < flat.w - 1; i++) put(buf, ex0 + i, GROUND - 2, '#9aa5a0')
        for (let i = 0; i < flat.w; i++) put(buf, ex0 + i, GROUND - 1, '#7b8580')
      } else {
        const lift = sc.t * 2
        const cx = ex0 + Math.round(m.w / 2)
        for (const [dx, dy] of [[-5, 1], [5, 0], [0, -2], [8, 3], [-8, 2]]) put(buf, cx + dx, GROUND - 5 + dy - lift, '#ffd02e')
        for (const [dx, dy] of [[-3, 2], [3, 1]]) put(buf, cx + dx, GROUND - 5 + dy - lift, '#ffffff')
      }
    } else {
      if (sc.gh) drawOcto(buf, ex0 + shake, ey, stage, hit || ulti ? '#ffffff' : null, sc.step)
      else drawMonster(buf, ex0 + shake, ey, stage, hit || ulti ? '#ffffff' : null)
      if (fighting) {
        // its life bar
        const by = ey - m.horn - 3
        for (let i = 0; i < m.w; i++) put(buf, ex0 + i, by, '#3a2020')
        for (let i = 0; i < Math.round(m.w * sc.hp); i++) put(buf, ex0 + i, by, '#ff5a5a')
      }
    }
  }

  // Minyam
  sprite(buf, BODY, bx, OY + bob)
  sprite(buf, [feet], bx, OY + 13)

  // the sword: sheathed when idle, up in stance and windup, flat when it swings
  if ((fighting || sc.st === 'die') && sc.gh) {
    // the pistol: held up a little at windup, a muzzle flash and a bullet at the shot
    const up = sc.pose === 'windup' ? -1 : 0
    const gy = OY + 7 + up
    for (let x = 15; x <= 22; x++) {
      put(buf, bx + x, gy - 1, '#7b8394')
      put(buf, bx + x, gy, '#3b4252')
    }
    put(buf, bx + 15, gy + 1, '#6b4a2f')
    put(buf, bx + 16, gy + 1, '#6b4a2f')
    put(buf, bx + 15, gy + 2, '#6b4a2f')
    put(buf, bx + 16, gy + 2, '#6b4a2f')
    put(buf, bx + 17, gy + 1, '#3b4252')
    if (sc.pose === 'swing' && sc.st === 'fight' && sc.ex != null) {
      for (const [dx, dy] of [[23, 0], [24, 0], [25, 0], [24, -1], [24, 1], [23, -1], [23, 1]]) put(buf, bx + dx, gy + dy, dx === 24 && dy === 0 ? '#ffffff' : '#ffd02e')
      for (let x = bx + 27; x < sc.ex + 2; x += 2) put(buf, x, gy, '#fff2a0')
    }
  } else if (fighting || sc.st === 'die') {
    if (sc.pose !== 'swing' && sc.st !== 'die') {
      for (let y = 0; y <= 6; y++) put(buf, bx + 14, OY + bob + y, y === 0 ? '#ffffff' : '#dfe6ee')
      for (const x of [13, 14, 15]) put(buf, bx + x, OY + bob + 7, '#ffd02e')
      put(buf, bx + 14, OY + bob + 8, '#8a5a2b')
      put(buf, bx + 14, OY + bob + 9, '#8a5a2b')
    } else {
      for (const y of [6, 7, 8]) put(buf, bx + 15, OY + y, '#ffd02e')
      for (let x = 16; x <= 25; x++) put(buf, bx + x, OY + 7, x === 25 ? '#ffffff' : '#dfe6ee')
      for (let x = 17; x <= 24; x++) put(buf, bx + x, OY + 6, '#aeb9c5')
      put(buf, bx + 13, OY + 7, '#8a5a2b')
      put(buf, bx + 14, OY + 7, '#8a5a2b')
    }
  }

  // skills
  if (sc.fx && sc.ex != null) {
    const { name, t } = sc.fx
    const ew = m.w
    if (name === 'cross') {
      for (let i = 0; i < m.h; i++) {
        put(buf, ex0 + Math.round((i * (ew - 1)) / (m.h - 1)), ey + i, '#7fe7ff')
        put(buf, ex0 + ew - 1 - Math.round((i * (ew - 1)) / (m.h - 1)), ey + i, '#7fe7ff')
      }
    } else if (name === 'wave') {
      const x = bx + 17 + t * 5
      for (let j = -5; j <= 5; j++) {
        const back = Math.floor(Math.abs(j) / 2)
        put(buf, x - back, OY + 7 + j, '#7fe7ff')
        put(buf, x - back + 1, OY + 7 + j, '#ffffff')
      }
    } else if (name === 'finish') {
      for (let i = 0; i < m.h + 2; i++) {
        put(buf, ex0 + ew - 1 - Math.round((i * (ew - 1)) / (m.h + 1)), ey - 1 + i, '#ffffff')
        put(buf, ex0 + ew - 2 - Math.round((i * (ew - 1)) / (m.h + 1)), ey - 1 + i, '#ffe08a')
      }
    } else {
      const cx = ex0 + Math.round(ew / 2)
      if (t === 0) {
        for (const [dx, dy] of [[14, -2], [16, 0], [12, -4], [15, 3], [11, 1]]) put(buf, bx + dx, OY + bob + dy, '#ffd02e')
      } else if (t < 3) {
        for (let y = 0; y < GROUND; y++) {
          for (let i = -3; i <= 2; i++) put(buf, cx + i, y, '#ffb02e')
          for (let i = -1; i <= 0; i++) put(buf, cx + i, y, '#ffffff')
        }
      } else {
        for (let j = -7; j <= 0; j++) {
          for (let i = -8; i <= 8; i++) {
            if (i * i + (j * 1.6) * (j * 1.6) <= 64) put(buf, cx + i, GROUND - 1 + j, (i + j) % 3 === 0 ? '#ffffff' : '#ff8a1e')
          }
        }
      }
    }
  }

  if (fighting && sc.ex != null && !sc.finishing) {
    pets.forEach((p, i) => {
      const pt = PETS[p.k]
      const ph = p.t % pt.period
      if (ph < 1 || ph > 2) return
      const w0 = pt.art[0].length
      const sx = petX(i) + w0
      const sy = pt.y + Math.floor(pt.art.length / 2)
      const tx = ex0 + Math.round(m.w / 3)
      const ty = GROUND - Math.round(m.h / 2)
      const f = ph / 3
      const x = Math.round(sx + (tx - sx) * f)
      const y = Math.round(sy + (ty - sy) * f)
      if (p.k === 'haiku') { put(buf, x, y, '#d6ffb0'); put(buf, x - 1, y, '#7ee07e') }
      else if (p.k === 'sonnet') {
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) put(buf, x + dx, y + dy, '#7fb8ff')
        put(buf, x, y, '#ffffff')
      } else {
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) put(buf, x + dx, y + dy, dx * dx + dy * dy <= 1 ? '#fff2a0' : '#ff8a1e')
      }
    })
  }

  const rows: [string | null, string | null][][] = []
  for (let y = 0; y < PH; y += 2) rows.push(buf[y].map((c, x) => [c, buf[y + 1][x]] as [string | null, string | null]))
  return rows
}
