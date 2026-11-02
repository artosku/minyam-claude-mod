// Sound for Minyam: short effects and a looping adventure tune. Both are off until the person asks.
// It plays the wav files of the sounds folder with what the computer already has:
// Windows: PowerShell (System.Media.SoundPlayer). macOS: afplay. Linux: paplay, aplay or ffplay.

export type Sfx = 'shot' | 'slash' | 'hit' | 'cross' | 'wave' | 'finish' | 'ultimate' | 'defeat' | 'pet' | 'done'

type Kind = 'win' | 'mac' | 'linux'

let kind: Kind | '' = ''
let linuxPlayer: string[] | null | undefined
let playing = 0
let daemon: AsyncIterator<unknown> | null = null
let daemonFile = ''
let daemonCount = 0
let tune: AsyncIterator<unknown> | null = null

const SEP = String.fromCharCode(92)
const quote = (p: string) => p.replace(/'/g, "''")

async function detect($: any): Promise<Kind> {
  if (kind !== '') return kind
  const os = await $.env.get('OS')
  if (os === 'Windows_NT') {
    kind = 'win'
  } else {
    let name = ''
    try {
      name = String((await $.process.run(['uname', '-s'])).stdout).trim()
    } catch {}
    kind = name === 'Darwin' ? 'mac' : 'linux'
  }
  return kind
}

// The player command for a file, or null where the computer has none.
async function playerFor($: any, file: string, loop: boolean): Promise<string[] | null> {
  const k = await detect($)
  if (k === 'win') {
    const play = loop
      ? `$p = New-Object System.Media.SoundPlayer '${quote(file)}'; $p.PlayLooping(); Start-Sleep -Seconds 86400`
      : `(New-Object System.Media.SoundPlayer '${quote(file)}').PlaySync()`
    return ['powershell', '-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', play]
  }
  let one: string[] | null
  if (k === 'mac') {
    one = ['afplay']
  } else {
    if (linuxPlayer === undefined) {
      linuxPlayer = null
      const options: string[][] = [['paplay'], ['aplay', '-q'], ['ffplay', '-nodisp', '-autoexit', '-loglevel', 'quiet']]
      for (const o of options) {
        try {
          const r = await $.process.run(['which', o[0]])
          if (r.exitCode === 0) { linuxPlayer = o; break }
        } catch {}
      }
    }
    one = linuxPlayer
  }
  if (!one) return null
  if (!loop) return [...one, file]
  return ['sh', '-c', `while :; do ${one.join(' ')} "$1" || exit 1; done`, 'sh', file]
}

export async function soundHelp($: any): Promise<string> {
  const k = await detect($)
  if (k === 'win') return 'Windows: pakai PowerShell bawaan, tidak perlu pasang apa pun.'
  if (k === 'mac') return 'macOS: pakai afplay bawaan, tidak perlu pasang apa pun.'
  const p = await playerFor($, '/dev/null', false)
  return p
    ? `Linux: memakai ${p[0]}.`
    : 'Linux: belum ada pemutar suara. Pasang salah satu: sudo apt install pulseaudio-utils (paplay), atau sudo apt install alsa-utils (aplay), atau sudo apt install ffmpeg (ffplay).'
}

// Windows: one PowerShell stays alive and plays a sound the moment the trigger file changes, so a
// fast fight does not start a new process for every blow. Elsewhere the players start at once.
const NAMES = ['shot', 'slash', 'hit', 'cross', 'wave', 'finish', 'ultimate', 'defeat', 'pet', 'done']

async function daemonStart($: any): Promise<boolean> {
  if (daemon) return true
  const tmp = (await $.env.get('TEMP')) ?? (await $.env.get('TMP')) ?? ''
  if (tmp === '') return false
  daemonFile = `${tmp}${SEP}minyam-sfx-${Math.floor(Math.random() * 1e9)}.txt`
  await $.fs.write(daemonFile, '0 none')
  const dir = `${$.plugin.root}${SEP}sounds`
  const script =
    `$d='${quote(dir)}'; $f='${quote(daemonFile)}'; $p=@{}; ` +
    `foreach($n in @(${NAMES.map(n => `'${n}'`).join(',')})){ $x=New-Object System.Media.SoundPlayer (Join-Path $d ($n+'.wav')); $x.Load(); $p[$n]=$x }; ` +
    `$last=''; while($true){ try{ $t=[IO.File]::ReadAllText($f) }catch{ $t='' }; ` +
    `if($t -ne $last){ $last=$t; $n=($t.Trim() -split ' ')[1]; if($p.ContainsKey($n)){ $p[$n].Play() } }; Start-Sleep -Milliseconds 30 }`
  const it = ($.process.spawn({ argv: ['powershell', '-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', script] }) as AsyncIterable<unknown>)[Symbol.asyncIterator]()
  daemon = it
  void (async () => {
    try {
      for (;;) {
        const r = await it.next()
        if (r.done) break
      }
    } catch {}
    if (daemon === it) daemon = null
  })()
  return true
}

export async function sfxStop() {
  const it = daemon
  daemon = null
  try {
    await it?.return?.()
  } catch {}
}

export async function sfxPlay($: any, name: Sfx) {
  try {
    const k = await detect($)
    if (k === 'win') {
      if (!(await daemonStart($))) return
      daemonCount += 1
      await $.fs.write(daemonFile, `${daemonCount} ${name}`)
      return
    }
    if (playing >= 3) return
    playing += 1
    try {
      const argv = await playerFor($, `${$.plugin.root}/sounds/${name}.wav`, false)
      if (argv) await $.process.run(argv, { timeoutMs: 8000 })
    } finally {
      playing -= 1
    }
  } catch {}
}

export const tuneRunning = () => tune !== null

export async function tuneStart($: any): Promise<boolean> {
  if (tune) return true
  const argv = await playerFor($, `${$.plugin.root}/sounds/adventure.wav`, true)
  if (!argv) return false
  const it = ($.process.spawn({ argv }) as AsyncIterable<unknown>)[Symbol.asyncIterator]()
  tune = it
  void (async () => {
    try {
      for (;;) {
        const r = await it.next()
        if (r.done) break
      }
    } catch {}
    if (tune === it) tune = null
  })()
  return true
}

export async function tuneStop() {
  const it = tune
  tune = null
  try {
    await it?.return?.()
  } catch {}
}
