import { app, BrowserWindow, ipcMain, shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { startLocalServer, stopLocalServer } from './server/app'

let mainWindow: BrowserWindow | null = null

function getAppIconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'icon.png')
    : join(app.getAppPath(), 'build/icon.png')
}

async function createWindow(): Promise<void> {
  await startLocalServer(app.getPath('userData'))

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 720,
    minWidth: 1180,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    title: 'CloakBrowserApp',
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.cloakbrowser.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
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
