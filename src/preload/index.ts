import { contextBridge, ipcRenderer } from 'electron'
import { IpcChannel, type DesktopApi } from '../shared/ipc'

const api: DesktopApi = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node
  },
  setThemeSource: (source) => ipcRenderer.invoke(IpcChannel.setThemeSource, source),
  setTitleBarHeight: (height) => ipcRenderer.invoke(IpcChannel.setTitleBarHeight, height)
}

contextBridge.exposeInMainWorld('desktop', api)
