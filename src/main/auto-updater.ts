import electronUpdater from 'electron-updater'
import { app } from 'electron'
import { is } from '@electron-toolkit/utils'

const { autoUpdater } = electronUpdater

const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000
const INITIAL_UPDATE_CHECK_DELAY_MS = 8 * 1000

function logUpdateMessage(message: string, error?: unknown): void {
  if (error) {
    console.warn(`[auto-update] ${message}`, error)
    return
  }
  console.info(`[auto-update] ${message}`)
}

async function checkForUpdates(): Promise<void> {
  try {
    await autoUpdater.checkForUpdatesAndNotify()
  } catch (error) {
    logUpdateMessage('Failed to check for updates.', error)
  }
}

export function initializeAutoUpdater(): void {
  if (is.dev || !app.isPackaged) {
    return
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => logUpdateMessage('Checking for updates.'))
  autoUpdater.on('update-available', (info) =>
    logUpdateMessage(`Update available: ${info.version}.`)
  )
  autoUpdater.on('update-not-available', (info) =>
    logUpdateMessage(`Already up to date: ${info.version}.`)
  )
  autoUpdater.on('update-downloaded', (info) =>
    logUpdateMessage(`Update downloaded: ${info.version}.`)
  )
  autoUpdater.on('error', (error) => logUpdateMessage('Updater error.', error))

  setTimeout(() => {
    void checkForUpdates()
  }, INITIAL_UPDATE_CHECK_DELAY_MS)

  setInterval(() => {
    void checkForUpdates()
  }, UPDATE_CHECK_INTERVAL_MS)
}
