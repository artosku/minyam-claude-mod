// The typing box of the Minyam pane. It keeps its own text and wraps it itself, so a long
// message goes down to the next line like the prompt of Claude Code does.
// Click the box, type, Enter sends, Esc gives the keys back.

let buf = ''
let focused = false
let blink = true

const SPECIAL = new Set(['up', 'down', 'left', 'right', 'tab', 'pageup', 'pagedown', 'home', 'end', 'escape', 'insert', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9', 'f10', 'f11', 'f12'])

export default function Chat(props: { hint?: string; w?: number } | undefined, surface: any) {
  const { Box, Text } = surface.elements
  const redraw = () => surface.setState({ n: (surface.state?.n ?? 0) + 1 })

  if (surface.state === undefined) {
    surface.every(530, () => { if (focused) { blink = !blink; redraw() } })
  }
  surface.onPointer((p: { type: string }) => {
    if (p.type === 'down') { focused = true; blink = true; redraw() }
    // the pointer left the box: most likely to click elsewhere; a key typed later turns it back on
    if (p.type === 'leave' && focused) { focused = false; redraw() }
  })

  surface.onKey((k: { key: string; ctrl?: true; shift?: true; meta?: true }) => {
    focused = true
    if (k.key === 'return') {
      if (k.shift) {
        buf += '\n'
      } else {
        const text = buf.trim()
        buf = ''
        if (text !== '') surface.post({ text })
      }
    } else if (k.key === 'backspace' || k.key === 'delete') {
      buf = Array.from(buf).slice(0, -1).join('')
    } else if (k.ctrl && k.key === 'u') {
      buf = ''
    } else if (k.ctrl || k.meta || SPECIAL.has(k.key)) {
      return
    } else if (k.key === 'space') {
      buf += ' '
    } else {
      buf += k.key
    }
    redraw()
  })

  const empty = buf === ''
  const edge = focused ? '#6bd66b' : '#5c6370'
  return (
    <Box flexDirection="column" width={props?.w}>
      <Text><Text color="#e5c07b" bold>KIRIM PESAN </Text>{focused ? <Text color="#6bd66b" bold>● siap mengetik</Text> : <Text dimColor>○ klik untuk mengetik</Text>}</Text>
      <Box borderStyle="round" borderColor={edge} paddingX={1} flexDirection="column" width={props?.w}>
        <Text wrap="wrap">
          {empty ? <Text dimColor>{focused ? '' : 'ketik pesan...'}</Text> : <Text>{buf}</Text>}
          <Text color="#6bd66b">{focused && blink ? '█' : ' '}</Text>
        </Text>
      </Box>
      <Text dimColor>{props?.hint ?? 'Enter kirim · Shift+Enter baris baru · Esc keluar'}</Text>
    </Box>
  )
}
