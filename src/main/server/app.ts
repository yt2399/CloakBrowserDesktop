import cors from 'cors'
import express from 'express'
import type { Server } from 'node:http'
import { closeDatabase, getDatabase } from './db/database'
import { ProfileStore } from './profile/profileStore'
import { SessionManager } from './session/sessionManager'
import { createHealthRouter } from './routes/healthRoutes'
import { createProfileRouter } from './routes/profileRoutes'

const PORT = Number(process.env.CLOAK_APP_API_PORT || 6788)
let server: Server | null = null
let sessions: SessionManager | null = null

export async function startLocalServer(userDataPath: string): Promise<void> {
  if (server) return

  const db = getDatabase(userDataPath)
  const store = new ProfileStore(db, userDataPath)
  store.ensureSeedData()
  sessions = new SessionManager()

  const app = express()
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: false }))
  app.use(cors({ origin: true, credentials: true }))
  app.use('/api', createHealthRouter())
  app.use('/api', createProfileRouter(store, sessions))

  await new Promise<void>((resolve) => {
    server = app.listen(PORT, '127.0.0.1', () => {
      console.log(`CloakBrowserApp API started on http://127.0.0.1:${PORT}/api`)
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
