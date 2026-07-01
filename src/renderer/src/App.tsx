import { useCallback, useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { AppSidebar, type PageKey, pageTitle } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { EmptyPage } from '@/components/empty-page'
import { KernelsPage } from '@/components/kernels-page'
import { ProfilesPage } from '@/components/profiles-page'
import { SettingsPage } from '@/components/settings-page'
import { SiteHeader } from '@/components/site-header'
import { Titlebar } from '@/components/titlebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { useProfiles } from '@/hooks/use-profiles'

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>('profiles')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [kernelInstalled, setKernelInstalled] = useState(false)
  const [workspacePaths, setWorkspacePaths] = useState<WorkspacePaths | null>(null)
  const store = useProfiles()
  const isKernelsPage = activePage === 'kernels'

  const refreshKernelStatus = useCallback(async () => {
    try {
      const status = await window.kernelReleases.installationStatus()
      setKernelInstalled(status.installed)
    } catch {
      setKernelInstalled(false)
    }
  }, [])

  const refreshWorkspacePaths = useCallback(async () => {
    try {
      setWorkspacePaths(await window.workspace.getPaths())
    } catch {
      setWorkspacePaths(null)
    }
  }, [])

  const handleWorkspaceChange = useCallback(
    async (next: WorkspacePaths) => {
      setWorkspacePaths(next)
      await refreshKernelStatus()
    },
    [refreshKernelStatus]
  )

  useEffect(() => {
    refreshKernelStatus()
    refreshWorkspacePaths()

    const refreshLocalState = () => {
      refreshKernelStatus()
      refreshWorkspacePaths()
    }

    window.addEventListener('focus', refreshLocalState)
    return () => window.removeEventListener('focus', refreshLocalState)
  }, [refreshKernelStatus, refreshWorkspacePaths])

  return (
    <div className="grid h-screen min-w-[1180px] grid-rows-[44px_1fr] bg-background">
      <Titlebar
        kernelInstalled={kernelInstalled}
        onOpenKernels={() => setActivePage('kernels')}
      />
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="min-h-0"
      >
        <AppSidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={!sidebarOpen}
          profilesDirectory={workspacePaths?.profilesDirectory ?? ''}
        />
        <SidebarInset className="min-w-0 bg-white">
          <SiteHeader
            title={pageTitle(activePage)}
            subtitle={
              isKernelsPage
                ? '按版本查看 CloakBrowser 免费版预编译内核及各系统下载。'
                : activePage === 'settings'
                  ? '查看应用实际使用的本地存储目录。'
                : undefined
            }
            action={
              isKernelsPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      'https://github.com/CloakHQ/CloakBrowser/releases',
                      '_blank',
                      'noopener,noreferrer'
                    )
                  }
                >
                  <ExternalLink className="size-4" />
                  查看 GitHub Releases
                </Button>
              ) : undefined
            }
          />
          <main className="flex-1 min-w-0 overflow-auto p-6">
            {activePage === 'profiles' && <ProfilesPage store={store} />}
            {activePage === 'kernels' && <KernelsPage />}
            {activePage === 'settings' && (
              <SettingsPage paths={workspacePaths} onChange={handleWorkspaceChange} />
            )}
            {activePage === 'proxy' && <EmptyPage />}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <Toaster richColors position="top-center" />
    </div>
  )
}
