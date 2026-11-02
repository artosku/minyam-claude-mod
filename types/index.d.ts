declare module 'claude-code' {
  interface PluginState {
    minyam: { isShown: boolean; say: string; isDocked: boolean; last: string; info: string; working: boolean; gear: string }
  }
}
export type Said = string
