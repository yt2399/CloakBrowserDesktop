import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { AppSidebar, type PageKey, pageTitle } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { EmptyPage } from '@/components/empty-page'
import { KernelsPage } from '@/components/kernels-page'
import { ProfilesPage } from '@/components/profiles-page'
import { SiteHeader } from '@/components/site-header'
import { Titlebar } from '@/components/titlebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { useProfiles } from '@/hooks/use-profiles'

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('profiles')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const store = useProfiles()
  const isKernelsPage = activePage === 'kernels'

  return (
    <div className="grid h-screen min-w-[1180px] grid-rows-[44px_1fr] bg-background">
      <Titlebar serviceOnline={store.serviceOnline} />
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="min-h-0"
      >
        <AppSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={!sidebarOpen}
        />
        <SidebarInset className="min-w-0 bg-white">
          <SiteHeader
            title={pageTitle(activePage)}
            subtitle={
              isKernelsPage
                ? '按版本查看 CloakBrowser 免费版预编译内核及各系统下载。'
                : undefined
            }
            action={
              isKernelsPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      'https://github.com/CloakHQ/CloakBrowser',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <ExternalLink className="size-4" />
                  查看开源项目
                </Button>
              ) : undefined
            }
          />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-6">
            {activePage === 'profiles' && <ProfilesPage store={store} />}
            {activePage === 'kernels' && <KernelsPage />}
            {(activePage === 'proxy' || activePage === 'settings') && (
              <EmptyPage page={activePage} />
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors position="top-center" />
    </div>
  )
}
