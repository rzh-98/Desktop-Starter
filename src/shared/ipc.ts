/** IPC channel names and payload types shared by main, preload and renderer. */
export const IpcChannel = {
  setThemeSource: 'app:set-theme-source',
  setTitleBarHeight: 'window:set-title-bar-height'
} as const

export type ThemeSource = 'system' | 'light' | 'dark'

/** The API exposed to the renderer as `window.desktop`. Keep it small and explicit. */
export interface DesktopApi {
  /** Node's `process.platform`: 'darwin' | 'win32' | 'linux' | ... */
  platform: string
  versions: { electron: string; chrome: string; node: string }
  setThemeSource: (source: ThemeSource) => Promise<void>
  /** Keeps macOS traffic lights vertically centred in the toolbar. */
  setTitleBarHeight: (height: number) => Promise<void>
}
