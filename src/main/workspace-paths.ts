import { app, dialog, shell } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

export type WorkspaceDirectory = 'workspace' | 'kernels' | 'profiles'

export interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

interface SettingsFile {
  workspaceDirectory: string
}

let cachedSettings: SettingsFile | null = null

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function defaultSettings(): SettingsFile {
  return { workspaceDirectory: app.getPath('userData') }
}

function loadSettings(): SettingsFile {
  if (cachedSettings) return cachedSettings

  const path = settingsPath()
  try {
    if (existsSync(path)) {
      const raw = readFileSync(path, 'utf-8')
      const parsed = JSON.parse(raw) as Partial<SettingsFile>
      if (parsed.workspaceDirectory && typeof parsed.workspaceDirectory === 'string') {
        cachedSettings = { workspaceDirectory: resolve(parsed.workspaceDirectory) }
        return cachedSettings
      }
    }
  } catch {
    // fall through to default + persist
  }

  cachedSettings = defaultSettings()
  saveSettings(cachedSettings)
  return cachedSettings
}

function saveSettings(settings: SettingsFile): void {
  cachedSettings = settings
  const path = settingsPath()
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(settings, null, 2), 'utf-8')
}

function applyWorkspaceEnv(settings: SettingsFile): void {
  process.env.CLOAKBROWSER_CACHE_DIR = join(settings.workspaceDirectory, 'kernels')
}

export function getWorkspacePaths(): WorkspacePaths {
  const settings = loadSettings()
  applyWorkspaceEnv(settings)
  return {
    workspaceDirectory: settings.workspaceDirectory,
    kernelDirectory: join(settings.workspaceDirectory, 'kernels'),
    profilesDirectory: join(settings.workspaceDirectory, 'profiles')
  }
}

export async function chooseWorkspaceDirectory(): Promise<WorkspacePaths | null> {
  const current = getWorkspacePaths()
  const result = await dialog.showOpenDialog({
    title: '选择工作目录',
    defaultPath: current.workspaceDirectory,
    buttonLabel: '设为工作目录',
    properties: ['openDirectory', 'createDirectory', 'dontAddToRecent']
  })

  if (result.canceled || result.filePaths.length === 0) return null

  const selected = resolve(result.filePaths[0]!)
  mkdirSync(selected, { recursive: true })
  const next: SettingsFile = { workspaceDirectory: selected }
  saveSettings(next)
  applyWorkspaceEnv(next)

  return {
    workspaceDirectory: selected,
    kernelDirectory: join(selected, 'kernels'),
    profilesDirectory: join(selected, 'profiles')
  }
}

export async function revealWorkspaceDirectory(): Promise<void> {
  const paths = getWorkspacePaths()
  mkdirSync(paths.workspaceDirectory, { recursive: true })
  const error = await shell.openPath(paths.workspaceDirectory)
  if (error) throw new Error(error)
}
