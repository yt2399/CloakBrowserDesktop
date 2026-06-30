import {
  AppWindow,
  ChevronDown,
  Chrome,
  ExternalLink,
  Globe2,
  Settings
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar'

export type PageKey = 'profiles' | 'proxy' | 'kernels' | 'settings'

export const navigationItems: Array<{ key: PageKey; label: string; icon: React.ReactNode }> = [
  { key: 'profiles', label: '环境', icon: <AppWindow className="size-[19px]" /> },
  { key: 'proxy', label: '代理', icon: <Globe2 className="size-[19px]" /> },
  { key: 'kernels', label: '内核下载', icon: <Chrome className="size-[19px]" /> },
  { key: 'settings', label: '设置', icon: <Settings className="size-[19px]" /> }
]

export function pageTitle(page: PageKey): string {
  return navigationItems.find((item) => item.key === page)?.label ?? ''
}

function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function AppSidebar({
  activePage,
  onNavigate,
  collapsed
}: {
  activePage: PageKey
  onNavigate: (page: PageKey) => void
  collapsed: boolean
}) {
  return (
    <Sidebar
      collapsible="none"
      className="border-r transition-[width] duration-200 ease-linear"
      style={
        { '--sidebar-width': collapsed ? '3.5rem' : '13rem' } as React.CSSProperties
      }
    >
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>导航</SidebarGroupLabel>}
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  isActive={activePage === item.key}
                  onClick={() => onNavigate(item.key)}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter>
          <div className="flex flex-col gap-2.5">
            <div className="relative rounded-xl border p-3.5">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#17b26a]" />
                <span className="text-sm font-semibold">本地工作空间</span>
              </div>
              <p className="mt-1 max-w-[150px] truncate font-mono text-xs text-muted-foreground">
                C:\CloakBrowserApp
              </p>
              <ChevronDown className="absolute right-3.5 top-4 size-4 text-muted-foreground" />
            </div>

            <button
              type="button"
              onClick={() => openExternalUrl('https://fluxbrowser.cn/')}
              className="group relative flex w-full items-center gap-2.5 rounded-xl border p-3.5 text-left transition hover:bg-white"
            >
              <Avatar className="size-[34px] rounded-lg bg-primary text-primary-foreground">
                <AvatarFallback className="rounded-lg bg-transparent text-sm font-semibold text-white">
                  F
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-[13px] font-semibold">使用 FluxBrowser 正式版</span>
                <span className="text-xs text-muted-foreground">访问 fluxbrowser.cn</span>
              </div>
              <ExternalLink className="ml-auto size-4 text-muted-foreground" />
            </button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
