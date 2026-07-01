export {}

type KernelPlatform = 'windows' | 'linux' | 'mac'

interface KernelPlatformDownload {
  name: string
  platform: KernelPlatform
  architecture: 'x64' | 'arm64'
  platformTag: string
  archive: string
  downloadUrl: string
  size: number
}

interface KernelRelease {
  tag: string
  version: string
  chromiumVersion: string
  releaseName: string
  patchLabel: string | null
  description: string
  publishedAt: string | null
  releaseUrl: string
  prerelease: boolean
  edition: 'free' | 'pro'
  platforms: KernelPlatformDownload[]
}

interface KernelReleaseResult {
  currentPlatform: KernelPlatform
  releases: KernelRelease[]
  fetchedAt: string
}

interface KernelInstallationStatus {
  installed: boolean
  version: string
  binaryPath: string
}

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

declare global {
  interface Window {
    appInfo: {
      name: string
      apiBaseUrl: string
    }
    appWindow: {
      minimize: () => Promise<void>
      toggleMaximize: () => Promise<boolean>
      close: () => Promise<void>
      isMaximized: () => Promise<boolean>
    }
    kernelReleases: {
      list: (force?: boolean) => Promise<KernelReleaseResult>
      installationStatus: () => Promise<KernelInstallationStatus>
      installedVersions: () => Promise<string[]>
      revealVersion: (payload: { version: string; edition: 'free' | 'pro' }) => Promise<void>
    }
    workspace: {
      getPaths: () => Promise<WorkspacePaths>
      chooseDirectory: () => Promise<WorkspacePaths | null>
      revealWorkspace: () => Promise<void>
    }
  }
}
