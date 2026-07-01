import { net, shell } from 'electron'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { getWorkspacePaths } from './workspace-paths'

const RELEASES_API_URL = 'https://api.github.com/repos/CloakHQ/CloakBrowser/releases'
const CACHE_TTL_MS = 15 * 60 * 1000

type SupportedPlatform = 'windows' | 'linux' | 'mac'
type SupportedArchitecture = 'x64' | 'arm64'

interface GithubAsset {
  name: string
  browser_download_url: string
  size: number
}

interface GithubRelease {
  tag_name: string
  name: string | null
  body: string | null
  html_url: string
  published_at: string | null
  prerelease: boolean
  assets: GithubAsset[]
}

export interface KernelPlatformDownload {
  name: string
  platform: SupportedPlatform
  architecture: SupportedArchitecture
  platformTag: string
  archive: string
  downloadUrl: string
  size: number
}

export interface KernelRelease {
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

export interface KernelReleaseResult {
  currentPlatform: SupportedPlatform
  releases: KernelRelease[]
  fetchedAt: string
}

export interface KernelInstallationStatus {
  installed: boolean
  version: string
  binaryPath: string
}

let releaseCache: KernelReleaseResult | null = null
let releaseRequest: Promise<KernelReleaseResult> | null = null

function currentPlatform(): SupportedPlatform {
  if (process.platform === 'darwin') return 'mac'
  if (process.platform === 'linux') return 'linux'
  return 'windows'
}

function platformName(
  platform: SupportedPlatform,
  architecture: SupportedArchitecture
): string {
  if (platform === 'windows') {
    return architecture === 'arm64' ? 'Windows ARM64' : 'Windows x64'
  }
  if (platform === 'mac') {
    return architecture === 'arm64' ? 'macOS Apple Silicon' : 'macOS Intel'
  }
  return architecture === 'arm64' ? 'Linux ARM64' : 'Linux x86_64'
}

function parsePlatformAsset(asset: GithubAsset): KernelPlatformDownload | null {
  const match = asset.name.match(
    /^cloakbrowser-(windows|linux|darwin|macos)-(x64|arm64)\.(?:zip|tar\.gz)$/i
  )
  if (!match) return null

  const rawPlatform = match[1].toLowerCase()
  const platform: SupportedPlatform =
    rawPlatform === 'darwin' || rawPlatform === 'macos'
      ? 'mac'
      : (rawPlatform as SupportedPlatform)
  const architecture = match[2].toLowerCase() as SupportedArchitecture

  return {
    name: platformName(platform, architecture),
    platform,
    architecture,
    platformTag: `${platform}-${architecture}`,
    archive: asset.name,
    downloadUrl: asset.browser_download_url,
    size: asset.size
  }
}

function stripMarkdown(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function releaseDescription(body: string | null, releaseName: string): string {
  if (!body) return releaseName

  const paragraphs = body
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(
      (paragraph) =>
        paragraph &&
        !paragraph.startsWith('#') &&
        !paragraph.startsWith('```') &&
        !paragraph.startsWith('|') &&
        !paragraph.startsWith('- ') &&
        !paragraph.startsWith('* ')
    )

  const summary = stripMarkdown(paragraphs[0] ?? '')
  if (!summary) return releaseName

  const patchSummary = summary.match(
    /^Pre-built Chromium with (\d+) source-level fingerprint patches\.?$/i
  )
  if (patchSummary) {
    return `预编译 Chromium 内核，包含 ${patchSummary[1]} 个源码级指纹补丁。`
  }

  return summary.length > 220 ? `${summary.slice(0, 217)}...` : summary
}

function parseRelease(release: GithubRelease): KernelRelease | null {
  if (!release.tag_name.startsWith('chromium-v')) return null

  const platforms = release.assets
    .map(parsePlatformAsset)
    .filter((asset): asset is KernelPlatformDownload => asset !== null)

  if (platforms.length === 0) return null

  const edition = /-pro$/i.test(release.tag_name) || /\(Pro\)/i.test(release.name ?? '')
    ? 'pro'
    : 'free'
  const version = release.tag_name
    .replace(/^chromium-v/i, '')
    .replace(/-pro$/i, '')
  const majorVersion = version.split('.')[0]
  const releaseName = release.name ?? `Chromium v${version}`
  const patchCount = release.body?.match(/(\d+)\s+(?:source-level\s+)?fingerprint patches/i)

  return {
    tag: release.tag_name,
    version,
    chromiumVersion: `Chromium ${majorVersion}`,
    releaseName,
    patchLabel: patchCount ? `${patchCount[1]} 个指纹补丁` : null,
    description: releaseDescription(release.body, releaseName),
    publishedAt: release.published_at,
    releaseUrl: release.html_url,
    prerelease: release.prerelease,
    edition,
    platforms
  }
}

async function fetchGithubReleases(): Promise<GithubRelease[]> {
  const releases: GithubRelease[] = []

  for (let page = 1; ; page += 1) {
    const response = await net.fetch(`${RELEASES_API_URL}?per_page=100&page=${page}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'CloakBrowserApp',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

    if (!response.ok) {
      throw new Error(`GitHub Releases 请求失败（${response.status}）`)
    }

    const pageReleases = (await response.json()) as GithubRelease[]
    releases.push(...pageReleases)

    if (pageReleases.length < 100) break
  }

  return releases
}

async function requestKernelReleases(): Promise<KernelReleaseResult> {
  const githubReleases = await fetchGithubReleases()
  const releases = githubReleases
    .map(parseRelease)
    .filter((release): release is KernelRelease => release !== null)
    .sort((left, right) => {
      const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : 0
      const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : 0
      return rightTime - leftTime
    })

  return {
    currentPlatform: currentPlatform(),
    releases,
    fetchedAt: new Date().toISOString()
  }
}

export async function getKernelReleases(force = false): Promise<KernelReleaseResult> {
  if (!force && releaseCache && Date.now() - Date.parse(releaseCache.fetchedAt) < CACHE_TTL_MS) {
    return releaseCache
  }

  if (!force && releaseRequest) return releaseRequest

  releaseRequest = requestKernelReleases()
    .then((result) => {
      releaseCache = result
      return result
    })
    .catch((error) => {
      if (releaseCache) return releaseCache
      throw error
    })
    .finally(() => {
      releaseRequest = null
    })

  return releaseRequest
}

export async function getKernelInstallationStatus(): Promise<KernelInstallationStatus> {
  const versions = await getInstalledKernelVersions()
  const { binaryInfo } = await import('cloakbrowser')
  const info = binaryInfo(versions[0])

  return {
    installed: versions.length > 0,
    version: versions[0] ?? info.version,
    binaryPath: info.binaryPath
  }
}

export async function getInstalledKernelVersions(): Promise<string[]> {
  const { binaryInfo } = await import('cloakbrowser')
  const cacheRoot = dirname(binaryInfo().cacheDir)

  if (!existsSync(cacheRoot)) return []

  const versions = new Set<string>()
  for (const entry of readdirSync(cacheRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue

    const match = entry.name.match(/^chromium-(\d+(?:\.\d+)+)(?:-pro)?$/i)
    if (!match) continue

    const executablePath =
      process.platform === 'darwin'
        ? join(cacheRoot, entry.name, 'Chromium.app', 'Contents', 'MacOS', 'Chromium')
        : join(cacheRoot, entry.name, process.platform === 'win32' ? 'chrome.exe' : 'chrome')

    if (existsSync(executablePath)) versions.add(match[1])
  }

  return [...versions].sort((left, right) =>
    right.localeCompare(left, undefined, { numeric: true, sensitivity: 'base' })
  )
}

export async function revealKernelDirectory(
  version: string,
  edition: 'free' | 'pro'
): Promise<void> {
  if (!version || !/^\d+(?:\.\d+)+$/.test(version)) {
    throw new Error('无效的内核版本号')
  }

  const { kernelDirectory } = getWorkspacePaths()
  const dirName = `chromium-${version}${edition === 'pro' ? '-pro' : ''}`
  const dirPath = join(kernelDirectory, dirName)

  if (!existsSync(dirPath)) {
    throw new Error(`内核 ${version} 尚未下载到工作目录`)
  }

  const error = await shell.openPath(dirPath)
  if (error) throw new Error(error)
}
