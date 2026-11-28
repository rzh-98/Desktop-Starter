import { getTauriVersion } from '@tauri-apps/api/app'
import { getCurrentWindow } from '@tauri-apps/api/window'

async function start() {
  const platform = import.meta.env.VITE_DESKTOP_PLATFORM
  const appWindow = getCurrentWindow()
  if (platform === 'darwin') {
    document.addEventListener('mousedown', (event) => {
      const target = event.target
      if (
        event.button !== 0 ||
        !(target instanceof Element) ||
        !target.closest('[data-drag-region]')
      )
        return
      if (target.closest('button,input,textarea,select,a,[role],[tabindex]')) return
      void appWindow.startDragging()
    })
  }
  window.desktop = {
    platform,
    insetTitleBar: platform === 'darwin',
    runtime: `Tauri ${await getTauriVersion()} · ${platform === 'win32' ? 'WebView2' : 'WebKit'}`,
    setThemeSource: (theme) => appWindow.setTheme(theme === 'system' ? null : theme)
  }
  await import('./main')
}

void start()
