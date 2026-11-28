import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel, type DesktopApi } from '../shared/ipc'

const api: DesktopApi = {
  platform: process.platform,
  insetTitleBar: process.platform === 'darwin',
  runtime: `Electron ${process.versions.electron} · Chromium ${process.versions.chrome.split('.')[0]}`,
  setThemeSource: (source) => ipcRenderer.invoke(IpcChannel.setThemeSource, source),
  setTitleBarHeight: (height) => ipcRenderer.invoke(IpcChannel.setTitleBarHeight, height)
}

contextBridge.exposeInMainWorld('desktop', api)
