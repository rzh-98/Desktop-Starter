import { createStore } from '@/lib/store'

export interface GeneralSettings {
  restoreWindows: boolean
  language: string
  workspace: string
  notifyUpdates: boolean
  notifyTasks: boolean
  sound: boolean
}

/** Example of persisted, app-wide settings: any page can read them with `generalSettings.use()`. */
export const generalSettings = createStore<GeneralSettings>('settings.general', {
  restoreWindows: true,
  language: 'system',
  workspace: '~/Documents',
  notifyUpdates: true,
  notifyTasks: true,
  sound: false
})
