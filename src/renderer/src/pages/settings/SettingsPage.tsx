import { useState } from 'react'
import { CircleCheck, Monitor, Moon, Sun } from 'lucide-react'
import { APP_NAME, APP_VERSION } from '@/app/config'
import { Page, PageContent, Toolbar } from '@/layout'
import {
  resetAppearance,
  setAppearance,
  useAppearance,
  type Density,
  type ThemePreference
} from '@/theme/appearance'
import {
  Button,
  Checkbox,
  ConfirmDialog,
  FormRow,
  Input,
  Notice,
  Section,
  SegmentedControl,
  Select,
  Switch
} from '@/ui'
import { AccentPicker } from './AccentPicker'
import { generalSettings, type GeneralSettings } from './store'

export function SettingsPage() {
  const appearance = useAppearance()
  const general = generalSettings.use()
  const [confirmReset, setConfirmReset] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  const set = <K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) =>
    generalSettings.set({ [key]: value })

  return (
    <Page>
      <Toolbar title="设置" />
      {resetDone && (
        <Notice tone="success" icon={<CircleCheck />} onDismiss={() => setResetDone(false)}>
          已恢复默认设置。
        </Notice>
      )}
      <PageContent width="narrow">
        <Section title="外观" description="对所有页面立即生效。" divided>
          <FormRow label="主题">
            <SegmentedControl<ThemePreference>
              aria-label="主题"
              value={appearance.theme}
              onValueChange={(theme) => setAppearance({ theme })}
              options={[
                { value: 'light', label: '浅色', icon: <Sun /> },
                { value: 'dark', label: '深色', icon: <Moon /> },
                { value: 'system', label: '跟随系统', icon: <Monitor /> }
              ]}
            />
          </FormRow>
          <FormRow label="强调色" description="用于主要按钮、选中项和焦点。">
            <AccentPicker
              value={appearance.accentHue}
              onChange={(accentHue) => setAppearance({ accentHue })}
            />
          </FormRow>
          <FormRow label="界面密度" description="调整控件高度、行高和页面边距。">
            <SegmentedControl<Density>
              aria-label="界面密度"
              value={appearance.density}
              onValueChange={(density) => setAppearance({ density })}
              options={[
                { value: 'compact', label: '紧凑' },
                { value: 'regular', label: '标准' },
                { value: 'comfortable', label: '宽松' }
              ]}
            />
          </FormRow>
        </Section>

        <Section title="通用" divided>
          <FormRow label="启动时恢复上次打开的窗口">
            <Switch
              checked={general.restoreWindows}
              onCheckedChange={(value) => set('restoreWindows', value)}
            />
          </FormRow>
          <FormRow label="语言">
            <Select
              value={general.language}
              onValueChange={(value) => set('language', value)}
              options={[
                { value: 'system', label: '跟随系统' },
                { value: 'zh-CN', label: '简体中文' },
                { value: 'en', label: 'English' },
                { value: 'ja', label: '日本語', disabled: true }
              ]}
            />
          </FormRow>
          <FormRow label="默认位置" description="新建文件的保存位置。">
            <Input
              value={general.workspace}
              onChange={(event) => set('workspace', event.target.value)}
              className="w-56 font-mono text-sm"
              spellCheck={false}
            />
          </FormRow>
        </Section>

        <Section title="通知">
          <div className="flex flex-col gap-3 py-3">
            <Checkbox
              label="新版本可用时提醒"
              checked={general.notifyUpdates}
              onCheckedChange={(value) => set('notifyUpdates', value === true)}
            />
            <Checkbox
              label="后台任务完成时提醒"
              description="例如导出、同步完成。"
              checked={general.notifyTasks}
              onCheckedChange={(value) => set('notifyTasks', value === true)}
            />
            <Checkbox
              label="播放提示音"
              disabled={!general.notifyUpdates && !general.notifyTasks}
              checked={general.sound}
              onCheckedChange={(value) => set('sound', value === true)}
            />
          </div>
        </Section>

        <Section title="关于" divided>
          <FormRow label={APP_NAME} description={`版本 ${APP_VERSION}`}>
            <Button disabled>检查更新</Button>
          </FormRow>
          {window.desktop && (
            <FormRow label="运行环境">
              <span className="selectable text-sm text-fg-muted tabular-nums">
                Electron {window.desktop.versions.electron} · Chromium{' '}
                {window.desktop.versions.chrome.split('.')[0]} · {window.desktop.platform}
              </span>
            </FormRow>
          )}
          <FormRow label="恢复默认设置" description="重置外观与通用设置，不会删除你的数据。">
            <Button className="text-danger-text" onClick={() => setConfirmReset(true)}>
              恢复默认…
            </Button>
          </FormRow>
        </Section>
      </PageContent>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="恢复默认设置？"
        description="主题、强调色、密度和通用设置将恢复为初始值。"
        confirmLabel="恢复默认"
        danger
        onConfirm={() => {
          resetAppearance()
          generalSettings.reset()
          setResetDone(true)
        }}
      />
    </Page>
  )
}
