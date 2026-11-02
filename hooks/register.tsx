import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { newScene, renderScene, tickScene, stageOf, monsterName, fxLabel, addPet, syncPets, petLabel } from './scene'
import type { PetKind } from './scene'
import type { Scene } from './scene'
import type { Cells } from './scene'
import { SPRITE } from './sprite'
import { sfxPlay, sfxStop, soundHelp, tuneStart, tuneStop, tuneRunning } from './sound'
import type { Sfx } from './sound'

const PANE = 'minyam'
const hideEmail = atom({ plugin: 'minyam', key: 'hideEmail' } as const, false)
const hideZone = atom({ plugin: 'minyam', key: 'hideZone' } as const, false)
const sfxOn = atom({ plugin: 'minyam', key: 'sfxOn' } as const, true)
const musicOn = atom({ plugin: 'minyam', key: 'musicOn' } as const, true)
const stageW = atom({ plugin: 'minyam', key: 'stageW' } as const, 54)
const isShown = atom({ plugin: 'minyam', key: 'isShown' } as const, true)
const say = atom({ plugin: 'minyam', key: 'say' } as const, 'Halo, aku Minyam. Aku jaga status di sini.')
const isDocked = atom({ plugin: 'minyam', key: 'isDocked' } as const, false)
const last = atom({ plugin: 'minyam', key: 'last' } as const, '')
const info = atom({ plugin: 'minyam', key: 'info' } as const, '')
const gearAtom = atom({ plugin: 'minyam', key: 'gear' } as const, '')
const sceneAtom = atom({ plugin: 'minyam', key: 'scene' } as const, '')
const working = atom({ plugin: 'minyam', key: 'working' } as const, false)

// What Minyam says goes to the bubble and, while shown, to the status line.
async function speak($: any, text: string) {
  await update($, say, () => text)
}

const short = (t: unknown, n = 44) => {
  const one = String(t ?? '').replace(/\s+/g, ' ').trim()
  return one.length > n ? `${one.slice(0, n - 1)}…` : one
}
const base = (p: unknown) => String(p ?? '').split(/[\\/]/).filter(Boolean).pop() ?? ''

// What the tool about to run is, in words: "menjalankan: git status".
function doing(e: any): string {
  const t = String(e.tool)
  if (t === 'Bash') return `Menjalankan: ${short(e.description || e.command)}`
  if (t === 'Read') return `Membaca ${base(e.file_path)}`
  if (t === 'Edit' || t === 'MultiEdit' || t === 'NotebookEdit') return `Mengubah ${base(e.file_path ?? e.notebook_path)}`
  if (t === 'Write') return `Menulis ${base(e.file_path)}`
  if (t === 'Grep' || t === 'Glob') return `Mencari ${short(e.pattern, 36)}`
  if (t === 'WebFetch' || t === 'WebSearch') return `Cari di web: ${short(e.query ?? e.url, 36)}`
  if (t === 'Agent' || t === 'Task') return `Memanggil agen: ${short(e.description, 32)}`
  return `Memakai ${t}`
}

// The equipment: each tool is a piece of gear in a slot of the bar.
const GEAR = [
  { key: 'bash', icon: '⚔', name: 'Bash' },
  { key: 'read', icon: '≡', name: 'Read' },
  { key: 'edit', icon: '⚒', name: 'Edit' },
  { key: 'write', icon: '✒', name: 'Write' },
  { key: 'grep', icon: '➳', name: 'Grep' },
  { key: 'glob', icon: '✧', name: 'Glob' },
  { key: 'agent', icon: '✦', name: 'Agent' },
  { key: 'web', icon: '◎', name: 'Web' },
  { key: 'other', icon: '▣', name: 'Lain' },
] as const

function gearOf(tool: string): string {
  if (tool === 'Bash') return 'bash'
  if (tool === 'Read') return 'read'
  if (tool === 'Edit' || tool === 'MultiEdit' || tool === 'NotebookEdit') return 'edit'
  if (tool === 'Write') return 'write'
  if (tool === 'Grep') return 'grep'
  if (tool === 'Glob') return 'glob'
  if (tool === 'Agent' || tool === 'Task') return 'agent'
  if (tool === 'WebFetch' || tool === 'WebSearch') return 'web'
  return 'other'
}

type Gear = { counts: Record<string, number>; active: string }
const readGear = (raw: string): Gear => {
  try { return raw ? JSON.parse(raw) : { counts: {}, active: '' } } catch { return { counts: {}, active: '' } }
}

// The scene lives in an atom, so a reload of this module cannot strand it mid-fight.
const parseScene = (raw: string): Scene => {
  try { return raw ? { ...newScene(), ...JSON.parse(raw) } : newScene() } catch { return newScene() }
}
async function mutateScene($: any, fn: (s: Scene) => void) {
  await update($, sceneAtom, raw => {
    const s = parseScene(raw)
    fn(s)
    return JSON.stringify(s)
  })
}
async function tickAtom($: any, checkPets: boolean) {
  const isWork = await read($, working)
  const wide = await read($, stageW)
  let sound: Sfx | null = null
  let live: Set<string> | null = null
  if (checkPets) {
    try {
      const all = await $.agent.list()
      live = new Set(all.filter((a: any) => a.status === 'running' || a.status === 'pending' || a.status === 'waiting').map((a: any) => String(a.id)))
    } catch {}
  }
  await update($, sceneAtom, raw => {
    const s = parseScene(raw)
    const hadPets = s.pets.length > 0
    const stBefore = s.st
    const gone = live ? syncPets(s, live) : false
    // the fight goes on while a sub agent still works, even when the main loop is idle
    if (hadPets && s.pets.length === 0 && !isWork && s.ex != null && s.pending === 0) s.pending = 1
    const moved = tickScene(s, isWork || s.pets.length > 0, wide)
    sound = null
    if (s.fx && s.fx.t === 0) sound = s.fx.name === 'ulti' ? 'ultimate' : s.fx.name
    else if (s.st === 'die' && stBefore !== 'die') sound = 'defeat'
    else if (s.flash && s.st === 'fight' && !s.fx) sound = s.pose === 'swing' ? (s.gh ? 'shot' : 'slash') : 'hit'
    return gone || moved ? JSON.stringify(s) : raw
  })
  if (sound && (await read($, sfxOn))) void sfxPlay($, sound)
}

// The tune is a child process; a reload of the module ends it, so it is started again when it is missing.
async function ensureTune($: any) {
  if ((await read($, musicOn)) && !tuneRunning()) await tuneStart($)
}

// A GitHub task: git push, pull, fetch, clone, merge, or the gh tool. Another monster, and Minyam shoots.
const isGithubCommand = (cmd: string) =>
  /\bgit(\s+-\S+(\s+\S+)?)*\s+(push|pull|fetch|clone|merge)\b/.test(cmd) || /\bgh\s+(pr|issue|repo|release|run|api|workflow|auth)\b/.test(cmd)

// A sub agent starts: its pet appears by the model it runs on.
const kindOf = (model: unknown): PetKind => {
  const m = String(model ?? '').toLowerCase()
  return m.includes('opus') ? 'opus' : m.includes('haiku') ? 'haiku' : 'sonnet'
}

type Info = {
  model: string; effort: string; dir: string; email: string
  branch: string; git: string; sync: string; commit: string
  minutes: number; ctxTokens: number; ctxWindow: number; ctxPct: number
  five: number | null; fiveIn: number | null; seven: number | null; cost: number | null; turns: number
}

async function git($: any, cwd: string, args: string[]): Promise<string> {
  try {
    const r = await $.process.run(['git', ...args], { cwd, timeoutMs: 1500 })
    return r.exitCode === 0 ? String(r.stdout).trim() : ''
  } catch {
    return ''
  }
}

// Model and effort change in the middle of a turn, so they are read again every few seconds on their own.
async function refreshPlayer($: any): Promise<void> {
  let model = ''
  let effort = ''
  try { model = await $.session.model() } catch { return }
  try {
    const home: string = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? ''
    const st = JSON.parse(await $.fs.read(`${home}/.claude/settings.json`))
    const level = st.modelSettings?.[model]?.effortLevel ?? st.effortLevel ?? ''
    effort = ({ low: 'low', medium: 'med', high: 'high', xhigh: 'max' } as any)[level] ?? ''
  } catch {}
  await update($, info, raw => {
    if (!raw) return raw
    const i = JSON.parse(raw)
    if (i.model === model && i.effort === effort) return raw
    return JSON.stringify({ ...i, model, effort })
  })
}

// What statusline.js showed, gathered again: model, folder, account, git, session, context, limits.
async function gather($: any): Promise<void> {
  const cwd: string = await $.session.cwd()
  const home: string = (await $.env.get('USERPROFILE')) ?? (await $.env.get('HOME')) ?? ''
  const out: Info = {
    model: '', effort: '', dir: cwd.split(/[\\/]/).filter(Boolean).pop() ?? '', email: '',
    branch: '', git: '', sync: '', commit: '', minutes: 0, ctxTokens: 0, ctxWindow: 0, ctxPct: 0,
    five: null, fiveIn: null, seven: null, cost: null, turns: 0,
  }
  try { out.model = await $.session.model() } catch {}
  try { out.turns = await $.session.turns() } catch {}
  try {
    const st = JSON.parse(await $.fs.read(`${home}/.claude/settings.json`))
    // the active model's own effort wins over the top-level one, as /effort saves it there
    const perModel = st.modelSettings?.[String(out.model)]?.effortLevel
    const level = perModel ?? st.effortLevel ?? ''
    out.effort = ({ low: 'low', medium: 'med', high: 'high', xhigh: 'max' } as any)[level] ?? ''
  } catch {}
  try {
    const cj = JSON.parse(await $.fs.read(`${home}/.claude.json`))
    out.email = cj?.oauthAccount?.emailAddress ?? ''
  } catch {}
  out.branch = await git($, cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])
  if (out.branch) {
    const lines = (await git($, cwd, ['status', '--porcelain'])).split(String.fromCharCode(10)).filter(Boolean)
    let staged = 0, modified = 0, untracked = 0
    for (const l of lines) {
      if (l[0] !== ' ' && l[0] !== '?') staged++
      if (l[1] === 'M') modified++
      if (l.startsWith('??')) untracked++
    }
    out.git = staged + modified + untracked === 0 ? '✓' : [staged ? `S:${staged}` : '', modified ? `M:${modified}` : '', untracked ? `U:${untracked}` : ''].filter(Boolean).join(' ')
    const ab = (await git($, cwd, ['rev-list', '--left-right', '--count', '@{u}...HEAD'])).split(/\s+/)
    const behind = parseInt(ab[0]) || 0, ahead = parseInt(ab[1]) || 0
    out.sync = `${ahead ? `↑${ahead}` : ''}${behind ? `↓${behind}` : ''}`
    const lc = (await git($, cwd, ['log', '-1', '--format=%h,%ar'])).split(',')
    out.commit = lc.length === 2 ? `${lc[0]} ${lc[1]}` : ''
  }
  try {
    const u = await $.session.usage()
    out.minutes = Math.floor(((await $.clock.now()) - u.startedAt) / 60000)
    // the same figure statusline.js showed: the window less the 33K the engine keeps back
    // for compacting, so "used" is counted against what can really be filled
    out.ctxWindow = u.context.window ?? 0
    const win = out.ctxWindow || 1000000
    const remaining = 100 - ((u.context.tokens ?? 0) / win) * 100
    const buffer = (33000 / win) * 100
    const used = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, ((remaining - buffer) / (100 - buffer)) * 100))))
    out.ctxPct = used
    out.ctxTokens = Math.round((used / 100) * (win / 1000)) * 1000
    for (const r of u.rateLimits as any[]) {
      const resets = r.resetsAt ? Math.max(0, Math.round((Date.parse(r.resetsAt) - (await $.clock.now())) / 60000)) : null
      if (r.kind === 'five_hour') { out.five = Math.round(r.percentUsed); out.fiveIn = resets }
      if (r.kind === 'seven_day') out.seven = Math.round(r.percentUsed)
    }
    out.cost = u.cost?.usd ?? null
  } catch {}
  await update($, info, () => JSON.stringify(out))
}

// The side pane when the terminal docks one, else the small band above the prompt.
// Theater is the default: tall where the pane sits above the prompt (full width there), the usual 54 columns where it docks.
async function show($: any, tall = true) {
  const opened = await $.ui.open({ id: PANE, title: 'Minyam', columns: 54, rows: tall ? 60 : 28 })
  await update($, isDocked, () => Boolean(opened.isPlaced))
}

function sprite(cells: Cells, Text: any) {
  return cells.map((row, y) => (
    <Text key={y}>
      {row.map(([top, bottom], x) =>
        top && bottom ? (
          <Text key={x} color={top} backgroundColor={bottom}>▀</Text>
        ) : top ? (
          <Text key={x} color={top}>▀</Text>
        ) : bottom ? (
          <Text key={x} color={bottom}>▄</Text>
        ) : (
          <Text key={x}> </Text>
        ),
      )}
    </Text>
  ))
}

export const register: Register = on => {
  let startedAt = 0
  let tools = 0
  // the walking scene: one enemy for each task
  let sceneW = 40
  let beat = 0

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'minyam',
      description: 'Show or hide Minyam, the chicken that tells the status',
      argumentHint: 'on | off | kecil | sfx on|off | musik on|off | hide-email | show-email | hide-folder | show-folder',
    })
    if (await read($, isShown)) void show($)
    void ensureTune($)
    void gather($)
    // minutes, limits and git move by themselves
    $.clock.every(60000, () => { void gather($); void ensureTune($) })
    $.clock.every(3000, () => { void refreshPlayer($) })
    $.clock.every(220, () => { beat += 1; void tickAtom($, beat % 5 === 0) })
    return next(e)
  })

  on('command.run', { command: 'minyam' }, async ($, e) => {
    const arg = String((e as any).args ?? '').trim().toLowerCase()
    const now = await read($, isShown)
    if (arg === 'hide-email' || arg === 'show-email') {
      const nextHide = arg === 'hide-email'
      await update($, hideEmail, () => nextHide)
      return { text: nextHide ? 'Email disembunyikan (depan jadi ******).' : 'Email ditampilkan lagi.' }
    }
    const [what, val] = arg.split(/\s+/)
    if (what === 'sfx' || what === 'musik' || what === 'music' || what === 'suara') {
      if (what === 'suara' && val === 'cek') {
        void sfxPlay($, 'defeat')
        return { text: await soundHelp($) }
      }
      const turnOn = val === 'on'
      if (val !== 'on' && val !== 'off') return { text: 'Pakai: /minyam sfx on|off, /minyam musik on|off, atau /minyam suara cek.' }
      if (what === 'sfx') {
        await update($, sfxOn, () => turnOn)
        if (turnOn) void sfxPlay($, 'done')
        if (!turnOn) await sfxStop()
        return { text: turnOn ? `Efek suara menyala. ${await soundHelp($)}` : 'Efek suara mati.' }
      }
      await update($, musicOn, () => turnOn)
      if (turnOn) {
        const ok = await tuneStart($)
        return { text: ok ? `Musik menyala. ${await soundHelp($)}` : `Musik belum bisa diputar. ${await soundHelp($)}` }
      }
      await tuneStop()
      return { text: 'Musik mati.' }
    }
    if (arg === 'hide-folder' || arg === 'show-folder') {
      const nextHide = arg === 'hide-folder'
      await update($, hideZone, () => nextHide)
      return { text: nextHide ? 'Nama folder disembunyikan.' : 'Nama folder ditampilkan lagi.' }
    }
    const small = arg === 'kecil' || arg === 'small'
    const next = arg === 'on' || arg === 'teater' || arg === 'theater' || small ? true : arg === 'off' ? false : !now
    await update($, isShown, () => next)
    if (next) {
      await show($, !small)
      await speak($, 'Aku di sini lagi.')
    } else {
      await $.ui.close({ id: PANE })
      await update($, isDocked, () => false)
    }
    return { text: next ? 'Minyam muncul.' : 'Minyam sembunyi. /minyam untuk memanggil lagi.' }
  })

  on('agent.spawn', async ($, e, next) => {
    const res: any = await next(e)
    if (res && res.agentId) {
      const kind = kindOf(res.model ?? (e as any).model)
      await mutateScene($, s => addPet(s, String(res.agentId), kind))
      if (await read($, sfxOn)) void sfxPlay($, 'pet')
    }
    return res
  })

  on('prompt.submit', async ($, e, next) => {
    startedAt = await $.clock.now()
    tools = 0
    await update($, working, () => true)
    await update($, gearAtom, () => JSON.stringify({ counts: {}, active: '' }))
    await speak($, 'Siap, aku kerjakan.')
    void gather($)
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    if (e.tool === 'Bash' && isGithubCommand(String((e as any).command ?? ''))) await mutateScene($, s => { s.gh = true })
    tools += 1
    await speak($, doing(e))
    const slot = gearOf(String(e.tool))
    await update($, gearAtom, raw => {
      const g = readGear(raw)
      return JSON.stringify({ counts: { ...g.counts, [slot]: (g.counts[slot] ?? 0) + 1 }, active: slot })
    })
    const ran = await next(e)
    await update($, gearAtom, raw => JSON.stringify({ ...readGear(raw), active: '' }))
    await mutateScene($, s => { s.pending = Math.min(2, s.pending + 1) }) // a task is done: the enemy in front of Minyam falls
    await speak($, 'Selesai satu langkah, mikir lagi...')
    return ran
  })

  on('turn.complete', async ($, e, next) => {
    if (await read($, sfxOn)) void sfxPlay($, 'done')
    const seconds = Math.round(((await $.clock.now()) - startedAt) / 1000)
    let ctx = ''
    try {
      const { context } = await $.session.usage()
      if (context.percent != null) ctx = ` · konteks ${Math.round(context.percent)}%`
    } catch {}
    await update($, last, () => `Giliran terakhir: ${seconds} dtk · ${tools} alat${ctx}`)
    await speak($, `Selesai ${seconds} dtk · ${tools} alat${ctx}. Nunggu perintah.`)
    await mutateScene($, s => { s.pending = s.ex != null ? 1 : 0 }) // the turn is over: only the enemy in front still falls, no backlog of kills
    await update($, working, () => false)
    await gather($)
    return next(e)
  })

  // The big Minyam and, in tidy boxes, everything the status line used to say.
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Client } = $.ui.resolve(e)
    const props = e.props as any
    // the content keeps to 54 columns however wide the pane is
    // as wide as the canvas when it is widened; the usual 54 at the default width
    const have: number = props.bodyColumns ?? 40
    const cols: number = have > 60 ? Math.min(have, 400) : Math.min(have, 54)
    const rows = props.placement === 'inline' ? (props.scroll?.bodyRows ?? 20) + 4 : (e.viewport?.rows ?? 40)
    const docked = await read($, isDocked)
    // theater: wide and inline -> the scene on the left, HP/MP/SP and the sheet on the right
    const theater = cols >= 80
    const lw = theater ? Math.max(48, Math.round(cols * 0.6)) : cols
    const RW = theater ? Math.max(30, Math.min(cols - lw - 2, 70)) : 38
    sceneW = Math.max(32, lw)
    if ((await read($, stageW)) !== sceneW) void update($, stageW, () => sceneW)
    const sceneRaw = await read($, sceneAtom)
    const shown: Scene = parseScene(sceneRaw)
    const text = await read($, say)
    const isWorking = await read($, working)
    const hid = await read($, hideEmail)
    const hidZone = await read($, hideZone)
    const raw = await read($, info)
    const gear = readGear(await read($, gearAtom))
    const i: Info | null = raw ? JSON.parse(raw) : null
    const hot = (n: number) => (n >= 80 ? '#ff5555' : n >= 50 ? '#e5c07b' : '#6bd66b')
    const kb = (n: number) => (n >= 1000000 ? `${n / 1000000}M` : `${Math.round(n / 1000)}K`)
    const two = cols >= 40
    const half = Math.floor((cols - 1) / 2)
    const full = cols
    const inner = (w: number) => Math.max(6, w - 4)
    const bar = (n: number, w: number) => {
      const filled = Math.round((Math.max(0, Math.min(100, n)) / 100) * w)
      return '█'.repeat(filled) + '░'.repeat(w - filled)
    }
    const hhmm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60}m` : `${m}m`)

    const card = (title: string, w: number, kids: any) => (
      <Box borderStyle="round" borderColor="#5c6370" flexDirection="column" paddingX={1} width={w}>
        <Text color="#f6c04b" bold>{title}</Text>
        {kids}
      </Box>
    )

    // a game bar: full is good, it empties as the figure is used up
    const tone = (rem: number, base: string) => (rem > 50 ? base : rem > 20 ? '#e5c07b' : '#ff5555')
    const slotW = Math.max(6, Math.floor(lw / 9))
    const three = !theater && cols >= 45
    const colW = theater ? RW : three ? Math.floor(cols / 3) : cols
    const segs = Math.max(6, colW - 4)
    // segmented, so it reads like a game gauge and not like a slab
    const seg = (n: number) => {
      const lit = Math.round((Math.max(0, Math.min(100, n)) / 100) * segs)
      return '▰'.repeat(lit) + '▱'.repeat(segs - lit)
    }
    const stat = (tag: string, base: string, used: number | null, caption: string) => {
      const rem = used == null ? null : Math.max(0, Math.min(100, 100 - used))
      const c = rem == null ? '#5c6370' : tone(rem, base)
      return (
        <Box flexDirection="column" width={colW} paddingRight={1}>
          <Text wrap="truncate-end"><Text bold color={base}>{tag}</Text><Text bold> {rem == null ? '--' : `sisa ${rem}%`}</Text></Text>
          <Text color={c} wrap="truncate-end">{seg(rem ?? 0)}</Text>
          {theater ? (
            <Text wrap="truncate-end" color="#8a919e">{caption} - {used == null ? '-' : `terpakai ${Math.round(used)}%`}</Text>
          ) : (
            <Text wrap="truncate-end" color="#8a919e">{used == null ? '-' : `terpakai ${Math.round(used)}%`}</Text>
          )}
          {theater ? null : <Text dimColor wrap="truncate-end">{caption}</Text>}
        </Box>
      )
    }
    // a status-sheet row: a coloured tag, then the value
    const row = (tag: string, color: string, value: any) => (
      <Box flexDirection="row" gap={1}>
        <Text backgroundColor="#2c313a" color={color} bold>{` ${tag.padEnd(6)} `}</Text>
        {value}
      </Box>
    )
    const rule = <Text color="#3b4048">{'─'.repeat(lw)}</Text>
    const ruleR = <Text color="#3b4048">{'─'.repeat(RW)}</Text>

    const bars = i && (
      <Box flexDirection={three ? 'row' : 'column'} marginTop={1}>
        {stat('HP', '#6bd66b', i.ctxWindow > 0 ? i.ctxPct : null, `konteks ${kb(i.ctxTokens)}/${kb(i.ctxWindow)}`)}
        {stat('MP', '#5aa9ff', i.five, i.fiveIn != null ? `5 jam: ${i.fiveIn}m` : '5 jam')}
        {stat('SP', '#ff9f43', i.seven, 'batas mingguan')}
      </Box>
    )
    const stage = (
      <Box flexDirection="column" marginTop={1}>
        <Box borderStyle="round" borderColor={isWorking ? '#e5c07b' : '#5c6370'} flexDirection="column" paddingX={1} width={Math.min(full, 54)}>
          <Text color={isWorking ? '#e5c07b' : '#6bd66b'} bold>{isWorking ? '● Lagi kerja' : '● Lagi diem'}  <Text dimColor>tumbang: {shown.kills}</Text>{shown.gh ? <Text color="#a58bd6" bold>  MODE GITHUB</Text> : null}</Text>
          {(shown.pets ?? []).length > 0 ? <Text color="#7ee07e" wrap="truncate">+ {(shown.pets ?? []).map(p => petLabel(p.k)).join(', ')} membantu</Text> : null}
          {shown.st === 'fight' ? <Text color="#ff9d5c" wrap="truncate">⚔ {monsterName(stageOf(shown.ft), shown.gh)} · COMBO x{shown.combo}{shown.fx ? ' · ' + fxLabel(shown.fx, shown.gh) : ''}</Text> : null}
          <Text wrap="wrap">{text === '' ? 'Nunggu perintah.' : text}</Text>
        </Box>
        <Text color={isWorking ? '#e5c07b' : '#5c6370'}>{'      ▼'}</Text>
        <Box flexDirection="column" alignItems="flex-start">{sprite(renderScene(sceneW, shown), Text)}</Box>
      </Box>
    )
    const gearEl = (
      <Box flexDirection="row" flexWrap="wrap" justifyContent="center">
        {GEAR.map(g => {
          const n = gear.counts[g.key] ?? 0
          const isActive = gear.active === g.key
          const color = isActive ? '#f6c04b' : n > 0 ? '#e6e6e6' : '#4b5263'
          return (
            <Box key={g.key} flexDirection="column" alignItems="center" width={slotW}>
              <Text backgroundColor={isActive ? '#5c4a1a' : '#2c313a'} color={color} bold>{` ${g.icon} `}</Text>
              <Text color={color} bold={n > 0}>{n > 0 ? `${n}x` : '-'}</Text>
              <Text color={color} wrap="truncate-end">{g.name}</Text>
            </Box>
          )
        })}
      </Box>
    )
    const sheet = i && (
      <Box flexDirection="column" marginTop={1}>
        {row('PLAYER', '#f6c04b', <Text wrap="truncate-end">{i.model}{i.effort ? ` (${i.effort})` : ''}</Text>)}
        {row('ZONE', '#c678dd', <Text wrap="truncate-end">{hidZone ? '******' : i.dir}</Text>)}
        {i.email !== '' && row('GUILD', '#56b6c2', <Text dimColor wrap="truncate-end">{hid ? i.email.replace(/^[^@]*/, '******') : i.email}</Text>)}
        {row('BRANCH', '#61afef', <Text wrap="truncate-end"><Text color="cyan">{i.branch || '-'}</Text><Text color="yellow"> {i.git}</Text><Text color="blue"> {i.sync}</Text></Text>)}
        {i.commit !== '' && row('LOOT', '#e5c07b', <Text dimColor wrap="truncate-end">{i.commit}</Text>)}
        <Box marginTop={1} flexDirection="row" gap={2}>
          <Text><Text color="#98c379" bold>TIME </Text>{hhmm(i.minutes)}</Text>
          <Text><Text color="#e5c07b" bold>GOLD </Text>{i.cost != null ? `$${i.cost.toFixed(2)}` : '-'}</Text>
          <Text><Text color="#ff9f43" bold>XP </Text>{i.turns}</Text>
        </Box>
      </Box>
    )

    // theater: the stage on the left, all the gauges and the sheet in one column on the right
    if (theater) {
      return (
        <Box flexDirection="column" width={full}>
          <Text wrap="truncate-end"><Text color="#f6c04b" bold>MINYAM</Text></Text>
          <Box flexDirection="row" gap={2}>
            <Box flexDirection="column" width={lw}>
              {stage}
              {gearEl}
              {rule}
            </Box>
            <Box flexDirection="column" width={RW}>
              {bars}
              <Box marginTop={1}>{ruleR}</Box>
              {sheet}
            </Box>
          </Box>
        </Box>
      )
    }

    return (
      <Box flexDirection="column" width={full}>
        <Text wrap="truncate-end">
          <Text color="#f6c04b" bold>MINYAM</Text>
        </Text>
        {bars}
        <Box marginTop={1}>{rule}</Box>
        {stage}
        {gearEl}
        {rule}
        {sheet}
        {docked && rule}
        {docked && (
          <Box marginTop={1}>
            <Client key="chat" module="./chat.tsx" width={full} props={{ w: full }} />
          </Box>
        )}
      </Box>
    )
  })

  // What is typed in the pane goes to the session as a prompt, like the one below.
  on('ui.message', { requestId: PANE }, async ($, e, next) => {
    const text = String((e.data as any)?.text ?? '').trim()
    // a slash command: run it as if it was typed; where that is refused, put it in the main box instead
    if (e.element === 'chat' && text.startsWith('/')) {
      const [word, ...rest] = text.slice(1).split(/\s+/)
      let msg = ''
      try {
        const out: any = await $.command.run({ command: word, args: rest.join(' ') })
        const said = String(out?.text ?? '').trim()
        msg = said !== '' ? said : `/${word} dijalankan.`
      } catch {
        const filled = await $.prompt.fill({ text, mode: 'replace' })
        msg = filled?.isFilled === false ? `/${word} tidak bisa dijalankan dari sini, ketik di kotak utama.` : `/${word} belum bisa dijalankan dari sini, sudah diisi ke kotak utama: tekan Enter di sana.`
      }
      await speak($, short(msg, 120))
      void $.ui.toast(short(msg, 120))
      return next(e)
    }
    if (e.element === 'chat' && text !== '') {
      startedAt = await $.clock.now()
      tools = 0
      await update($, working, () => true)
      await update($, gearAtom, () => JSON.stringify({ counts: {}, active: '' }))
      await speak($, 'Siap, aku kerjakan.')
      void $.prompt.submit({ text })
    }
    return next(e)
  })

  // The bubble: on the left, with its tail toward Minyam on the right; without a dock the small Minyam comes with it.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isShown)) || (await read($, isDocked))) return next(e)
    const text = await read($, say)
    const docked = false
    const { Box, Text } = $.ui.resolve(e)
    const working = Boolean(e.props.isWorking)
    const bubble = (
      <Box flexDirection="row" alignItems="center" justifyContent="flex-end">
        <Box borderStyle="round" borderColor={working ? '#e5c07b' : '#5c6370'} flexDirection="column" paddingX={1}>
          <Text color={working ? '#e5c07b' : '#6bd66b'} bold>{working ? '● Lagi kerja' : '● Lagi diem'}</Text>
          <Text wrap="wrap">{working ? text : text === '' ? 'Nunggu perintah.' : text}</Text>
        </Box>
        <Text color={working ? '#e5c07b' : '#5c6370'}>▶</Text>
      </Box>
    )
    if (docked) return bubble

    return (
      <Box flexDirection="row" gap={2}>
        <Box flexDirection="column">{sprite(SPRITE, Text)}</Box>
        <Box flexDirection="column" justifyContent="center">{bubble}</Box>
      </Box>
    )
  })
}
