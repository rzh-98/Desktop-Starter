import { Monitor, Moon, Sun, SunMoon } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem } from '@/layout'
import { modKey } from '@/lib/platform'
import {
  setAppearance,
  useAppearance,
  type Density,
  type ThemePreference
} from '@/theme/appearance'
import {
  Menu,
  MenuContent,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger
} from '@/ui'
import { APP_NAME } from './config'
import type { PageDefinition } from './pages'

interface AppSidebarProps {
  pages: PageDefinition[]
  currentId: string | undefined
  onNavigate: (id: string) => void
}

export function AppSidebar({ pages, currentId, onNavigate }: AppSidebarProps) {
  const mainPages = pages.filter((page) => page.placement !== 'bottom')
  const bottomPages = pages.filter((page) => page.placement === 'bottom')

  const item = (page: PageDefinition, index?: number) => {
    const Icon = page.icon
    return (
      <SidebarItem
        key={page.id}
        icon={Icon ? <Icon /> : undefined}
        active={page.id === currentId}
        onClick={() => onNavigate(page.id)}
        title={
          index !== undefined && index < 9 ? `${page.title}（${modKey}${index + 1}）` : undefined
        }
      >
        {page.title}
      </SidebarItem>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <span className="truncate text-base font-semibold text-fg mac:hidden">{APP_NAME}</span>
      </SidebarHeader>
      <SidebarContent aria-label="主导航">
        <div className="flex flex-col gap-px">
          {mainPages.map((page, index) => item(page, index))}
        </div>
      </SidebarContent>
      <SidebarFooter>
        {bottomPages.map((page) => item(page))}
        <AppearanceMenu />
      </SidebarFooter>
    </Sidebar>
  )
}

const themeIcons = { light: Sun, dark: Moon, system: Monitor }

/** Quick theme / density switcher that stays available even without a settings page. */
function AppearanceMenu() {
  const { theme, density } = useAppearance()
  const Icon = themeIcons[theme] ?? SunMoon
  return (
    <Menu>
      <MenuTrigger asChild>
        <SidebarItem icon={<Icon />}>外观</SidebarItem>
      </MenuTrigger>
      <MenuContent side="top" align="start" className="w-48">
        <MenuLabel>主题</MenuLabel>
        <MenuRadioGroup
          value={theme}
          onValueChange={(value) => setAppearance({ theme: value as ThemePreference })}
        >
          <MenuRadioItem value="light">浅色</MenuRadioItem>
          <MenuRadioItem value="dark">深色</MenuRadioItem>
          <MenuRadioItem value="system">跟随系统</MenuRadioItem>
        </MenuRadioGroup>
        <MenuSeparator />
        <MenuLabel>界面密度</MenuLabel>
        <MenuRadioGroup
          value={density}
          onValueChange={(value) => setAppearance({ density: value as Density })}
        >
          <MenuRadioItem value="compact">紧凑</MenuRadioItem>
          <MenuRadioItem value="regular">标准</MenuRadioItem>
          <MenuRadioItem value="comfortable">宽松</MenuRadioItem>
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}
