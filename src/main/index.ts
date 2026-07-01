import { app, BrowserWindow, ipcMain, shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import {
  downloadKernel,
  getInstalledKernelVersions,
  getKernelInstallationStatus,
  getKernelReleases,
  revealKernelDirectory
} from './kernel-releases'
import { startLocalServer, stopLocalServer } from './server/app'
import {
  chooseWorkspaceDirectory,
  getWorkspacePaths,
  revealWorkspaceDirectory
} from './workspace-paths'

let mainWindow: BrowserWindow | null = null

function getAppIconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(app.getAppPath(), 'build/icon.png')
}

async function createWindow(): Promise<void> {
  // Initialize workspace (load settings + apply CLOAKBROWSER_CACHE_DIR)
  // BEFORE startLocalServer, so the dynamic cloakbrowser import sees the env var.
  getWorkspacePaths()
  await startLocalServer(app.getPath('userData'))

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 720,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    title: 'CloakBrowserDesktop',
    icon: getAppIconPath(),
    frame: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function getWindowFromEvent(event: IpcMainInvokeEvent): BrowserWindow | null {
  return BrowserWindow.fromWebContents(event.sender)
}

ipcMain.handle('window:minimize', (event) => {
  getWindowFromEvent(event)?.minimize()
})

ipcMain.handle('window:toggle-maximize', (event) => {
  const window = getWindowFromEvent(event)
  if (!window) return false
  if (window.isMaximized()) {
    window.unmaximize()
    return false
  }
  window.maximize()
  return true
})

ipcMain.handle('window:close', (event) => {
  getWindowFromEvent(event)?.close()
})

ipcMain.handle('window:is-maximized', (event) => {
  return Boolean(getWindowFromEvent(event)?.isMaximized())
})

ipcMain.handle('kernels:list-releases', (_event, force?: boolean) => {
  return getKernelReleases(Boolean(force))
})

ipcMain.handle('kernels:installation-status', () => {
  return getKernelInstallationStatus()
})

ipcMain.handle('kernels:installed-versions', () => {
  return getInstalledKernelVersions()
})

ipcMain.handle(
  'kernels:download',
  (event, payload: { version: string; edition: 'free' | 'pro' }) => {
    if (!payload || typeof payload.version !== 'string') {
      throw new Error('缺少内核版本号')
    }
    return downloadKernel(payload.version, payload.edition, (progress) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send('kernels:download-progress', progress)
      }
    })
  }
)

ipcMain.handle(
  'kernels:reveal-version',
  (_event, payload: { version: string; edition: 'free' | 'pro' }) => {
    if (!payload || typeof payload.version !== 'string') {
      throw new Error('缺少内核版本号')
    }
    return revealKernelDirectory(payload.version, payload.edition)
  }
)

ipcMain.handle('workspace:get-paths', () => {
  return getWorkspacePaths()
})

ipcMain.handle('workspace:choose-directory', () => {
  return chooseWorkspaceDirectory()
})

ipcMain.handle('workspace:reveal-workspace', () => {
  return revealWorkspaceDirectory()
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.cloakbrowser.app')

  app.on('browser-window-created', (_, window) => {
    if (is.dev) {
      optimizer.watchWindowShortcuts(window)
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('before-quit', async () => {
  await stopLocalServer()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
