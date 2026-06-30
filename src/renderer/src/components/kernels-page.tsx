import { Apple, Chrome, Copy, Download, Github, Monitor, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type PlatformIconName = 'windows' | 'linux' | 'mac'

interface PlatformDownload {
  name: string
  platformTag: string
  archive: string
  primaryUrl: string
  githubUrl: string
  icon: PlatformIconName
}

interface KernelRelease {
  version: string
  chromiumVersion: string
  patchLabel: string
  description: string
  platforms: PlatformDownload[]
}

const kernelReleases: KernelRelease[] = [
  {
    version: '146.0.7680.177.5',
    chromiumVersion: 'Chromium 146',
    patchLabel: '58 个指纹补丁',
    description: '当前免费版推荐内核，适合 Windows 桌面以及 Linux 桌面和服务器环境。',
    platforms: [
      {
        name: 'Windows x64',
        platformTag: 'windows-x64',
        archive: 'cloakbrowser-windows-x64.zip',
        primaryUrl:
          'https://cloakbrowser.dev/chromium-v146.0.7680.177.5/cloakbrowser-windows-x64.zip',
        githubUrl:
          'https://github.com/CloakHQ/cloakbrowser/releases/download/chromium-v146.0.7680.177.5/cloakbrowser-windows-x64.zip',
        icon: 'windows'
      },
      {
        name: 'Linux x86_64',
        platformTag: 'linux-x64',
        archive: 'cloakbrowser-linux-x64.tar.gz',
        primaryUrl:
          'https://cloakbrowser.dev/chromium-v146.0.7680.177.5/cloakbrowser-linux-x64.tar.gz',
        githubUrl:
          'https://github.com/CloakHQ/cloakbrowser/releases/download/chromium-v146.0.7680.177.5/cloakbrowser-linux-x64.tar.gz',
        icon: 'linux'
      }
    ]
  },
  {
    version: '146.0.7680.177.3',
    chromiumVersion: 'Chromium 146',
    patchLabel: '58 个指纹补丁',
    description: 'ARM64 平台预编译版本，适合 ARM 服务器、树莓派和 Graviton 实例。',
    platforms: [
      {
        name: 'Linux arm64',
        platformTag: 'linux-arm64',
        archive: 'cloakbrowser-linux-arm64.tar.gz',
        primaryUrl:
          'https://cloakbrowser.dev/chromium-v146.0.7680.177.3/cloakbrowser-linux-arm64.tar.gz',
        githubUrl:
          'https://github.com/CloakHQ/cloakbrowser/releases/download/chromium-v146.0.7680.177.3/cloakbrowser-linux-arm64.tar.gz',
        icon: 'linux'
      }
    ]
  },
  {
    version: '145.0.7632.109.2',
    chromiumVersion: 'Chromium 145',
    patchLabel: '26 个指纹补丁',
    description: '适用于 Apple Silicon 与 Intel 芯片的 macOS 免费版内核。',
    platforms: [
      {
        name: 'macOS Apple Silicon',
        platformTag: 'darwin-arm64',
        archive: 'cloakbrowser-darwin-arm64.tar.gz',
        primaryUrl:
          'https://cloakbrowser.dev/chromium-v145.0.7632.109.2/cloakbrowser-darwin-arm64.tar.gz',
        githubUrl:
          'https://github.com/CloakHQ/cloakbrowser/releases/download/chromium-v145.0.7632.109.2/cloakbrowser-darwin-arm64.tar.gz',
        icon: 'mac'
      },
      {
        name: 'macOS Intel',
        platformTag: 'darwin-x64',
        archive: 'cloakbrowser-darwin-x64.tar.gz',
        primaryUrl:
          'https://cloakbrowser.dev/chromium-v145.0.7632.109.2/cloakbrowser-darwin-x64.tar.gz',
        githubUrl:
          'https://github.com/CloakHQ/cloakbrowser/releases/download/chromium-v145.0.7632.109.2/cloakbrowser-darwin-x64.tar.gz',
        icon: 'mac'
      }
    ]
  }
]

function openExternalUrl(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

function PlatformIcon({ icon }: { icon: PlatformIconName }) {
  if (icon === 'mac') return <Apple className="size-[18px]" />
  if (icon === 'linux') return <Terminal className="size-[18px]" />
  return <Monitor className="size-[18px]" />
}

export function KernelsPage() {
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('下载地址已复制')
    } catch {
      toast.error('复制失败，请手动打开链接')
    }
  }

  const buildCount = kernelReleases.reduce(
    (total, release) => total + release.platforms.length,
    0
  )

  return (
    <div className="max-w-[1220px] space-y-5">
      <div className="grid grid-cols-4 gap-3">
        <div className="space-y-1 rounded-lg border bg-card p-3.5">
          <span className="text-xs text-muted-foreground">内核版本</span>
          <p className="text-base font-semibold">{kernelReleases.length}</p>
        </div>
        <div className="space-y-1 rounded-lg border bg-card p-3.5">
          <span className="text-xs text-muted-foreground">可用系统构建</span>
          <p className="text-base font-semibold">{buildCount}</p>
        </div>
        <div className="space-y-1 rounded-lg border bg-card p-3.5">
          <span className="text-xs text-muted-foreground">最新版本</span>
          <p className="text-base font-semibold">Chromium 146</p>
        </div>
        <div className="space-y-1 rounded-lg border bg-card p-3.5">
          <span className="text-xs text-muted-foreground">下载源</span>
          <p className="text-base font-semibold">官方源 + GitHub</p>
        </div>
      </div>

      <div className="grid grid-cols-2 items-stretch gap-4">
        {kernelReleases.map((release) => (
          <article
            key={release.version}
            className="flex min-h-[300px] flex-col overflow-hidden rounded-lg border bg-card"
          >
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Chrome className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold">{release.chromiumVersion}</h2>
                    <p className="font-mono text-xs text-muted-foreground">{release.version}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#e9f8ef] text-[#079455]">
                  免费版
                </Badge>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {release.description}
              </p>

              <div className="mt-5 flex items-center gap-8 border-y py-3">
                <div>
                  <p className="text-xs text-muted-foreground">指纹补丁</p>
                  <p className="mt-1 text-sm font-semibold">{release.patchLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">支持系统</p>
                  <p className="mt-1 text-sm font-semibold">
                    {release.platforms.map((platform) => platform.name).join(' / ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t bg-muted/20 px-5 py-3.5">
              <p className="mb-1 text-xs font-medium text-muted-foreground">系统下载</p>
              <div className="divide-y">
                {release.platforms.map((platform) => (
                  <div
                    key={platform.platformTag}
                    className="flex min-h-14 items-center justify-between gap-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-white">
                        <PlatformIcon icon={platform.icon} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{platform.name}</p>
                        <p
                          className="truncate font-mono text-[11px] text-muted-foreground"
                          title={platform.archive}
                        >
                          {platform.archive}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={() => openExternalUrl(platform.primaryUrl)}
                      >
                        <Download className="size-3.5" />
                        下载
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="复制下载地址"
                        onClick={() => copyUrl(platform.primaryUrl)}
                      >
                        <Copy className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="GitHub 备用下载"
                        onClick={() => openExternalUrl(platform.githubUrl)}
                      >
                        <Github className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
