import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

let db: Database.Database | null = null

export function getDatabase(userDataPath: string): Database.Database {
  if (db) return db

  mkdirSync(userDataPath, { recursive: true })
  db = new Database(join(userDataPath, 'cloak-browser-app.sqlite'))
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      seed TEXT NOT NULL,
      userDataDir TEXT NOT NULL,
      proxy TEXT NOT NULL DEFAULT '',
      geoip INTEGER NOT NULL DEFAULT 1,
      timezone TEXT NOT NULL,
      locale TEXT NOT NULL,
      platform TEXT NOT NULL,
      screenWidth INTEGER NOT NULL,
      screenHeight INTEGER NOT NULL,
      hardwareConcurrency INTEGER NOT NULL,
      deviceMemory INTEGER NOT NULL,
      storageQuotaMb INTEGER NOT NULL,
      startUrl TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      lastOpenedAt INTEGER
    );
  `)
  return db
}

export function closeDatabase(): void {
  db?.close()
  db = null
}
