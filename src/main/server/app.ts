import cors from 'cors'
import express from 'express'
import type { Server } from 'node:http'
import { getInstalledKernelVersions } from '../kernel-releases'
import { closeDatabase, getDatabase } from './db/database'
import { ProfileStore } from './profile/profileStore'
import { ProxyStore } from './proxy/proxyStore'
import { SessionManager } from './session/sessionManager'
import { createHealthRouter } from './routes/healthRoutes'
import { createProfileRouter } from './routes/profileRoutes'
import { createProxyRouter } from './routes/proxyRoutes'
import { getWorkspacePaths } from '../workspace-paths'

const PORT = Number(process.env.CLOAK_APP_API_PORT || 6788)
let server: Server | null = null
let sessions: SessionManager | null = null

export async function startLocalServer(userDataPath: string): Promise<void> {
  if (server) return

  const db = getDatabase(userDataPath)
  const paths = getWorkspacePaths()
  const store = new ProfileStore(db, paths.profilesDirectory)
  const proxyStore = new ProxyStore(db)
  const [defaultBrowserVersion = ''] = await getInstalledKernelVersions()
  store.assignDefaultBrowserVersion(defaultBrowserVersion)
  sessions = new SessionManager()

  const app = express()
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: false }))
  app.use(cors({ origin: true, credentials: true }))
  app.use('/api', createHealthRouter())
  app.use('/api', createProfileRouter(store, sessions))
  app.use('/api', createProxyRouter(proxyStore))

  await new Promise<void>((resolve) => {
    server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`CloakBrowserDesktop API started on http://127.0.0.1:${PORT}/api`)
      resolve()
    })
  })
}

export async function stopLocalServer(): Promise<void> {
  await sessions?.closeAll()
  sessions = null

  if (server) {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve())
    })
    server = null
  }

  closeDatabase()
}
