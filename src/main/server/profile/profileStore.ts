import type Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createProfileId, createProfileSeed } from './seed'
import type { BrowserProfile, ProfileInput } from './types'

const DEFAULTS = {
  geoip: true,
  timezone: 'Asia/Shanghai',
  locale: 'zh-CN',
  platform: 'windows' as const,
  screenWidth: 1920,
  screenHeight: 1080,
  hardwareConcurrency: 8,
  deviceMemory: 8,
  storageQuotaMb: 5000,
  startUrl: 'https://example.com'
}

type ProfileRow = Omit<BrowserProfile, 'geoip'> & { geoip: number }

function mapProfile(row: ProfileRow): BrowserProfile {
  return {
    ...row,
    geoip: Boolean(row.geoip)
  }
}

export class ProfileStore {
  private db: Database.Database
  private userDataPath: string

  constructor(db: Database.Database, userDataPath: string) {
    this.db = db
    this.userDataPath = userDataPath
  }

  list(): BrowserProfile[] {
    const rows = this.db
      .prepare('SELECT * FROM profiles ORDER BY updatedAt DESC')
      .all() as ProfileRow[]
    return rows.map(mapProfile)
  }

  get(id: string): BrowserProfile | null {
    const row = this.db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as
      | ProfileRow
      | undefined
    return row ? mapProfile(row) : null
  }

  create(input: ProfileInput): BrowserProfile {
    const id = createProfileId()
    const now = Date.now()
    const userDataDir = join(this.userDataPath, 'profiles', id)
    mkdirSync(userDataDir, { recursive: true })

    const profile: BrowserProfile = {
      id,
      name: input.name?.trim() || '新的浏览器环境',
      seed: createProfileSeed(id),
      userDataDir,
      proxy: input.proxy?.trim() || '',
      geoip: input.geoip ?? DEFAULTS.geoip,
      timezone: input.timezone?.trim() || DEFAULTS.timezone,
      locale: input.locale?.trim() || DEFAULTS.locale,
      platform: input.platform || DEFAULTS.platform,
      screenWidth: input.screenWidth || DEFAULTS.screenWidth,
      screenHeight: input.screenHeight || DEFAULTS.screenHeight,
      hardwareConcurrency: input.hardwareConcurrency || DEFAULTS.hardwareConcurrency,
      deviceMemory: input.deviceMemory || DEFAULTS.deviceMemory,
      storageQuotaMb: input.storageQuotaMb || DEFAULTS.storageQuotaMb,
      startUrl: input.startUrl?.trim() || DEFAULTS.startUrl,
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: null
    }

    this.db
      .prepare(
        `INSERT INTO profiles (
          id, name, seed, userDataDir, proxy, geoip, timezone, locale, platform,
          screenWidth, screenHeight, hardwareConcurrency, deviceMemory,
          storageQuotaMb, startUrl, createdAt, updatedAt, lastOpenedAt
        ) VALUES (
          @id, @name, @seed, @userDataDir, @proxy, @geoip, @timezone, @locale, @platform,
          @screenWidth, @screenHeight, @hardwareConcurrency, @deviceMemory,
          @storageQuotaMb, @startUrl, @createdAt, @updatedAt, @lastOpenedAt
        )`
      )
      .run({ ...profile, geoip: profile.geoip ? 1 : 0 })

    return profile
  }

  update(id: string, input: ProfileInput): BrowserProfile {
    const current = this.get(id)
    if (!current) throw new Error('环境不存在')

    const next: BrowserProfile = {
      ...current,
      ...input,
      name: input.name?.trim() || current.name,
      proxy: input.proxy?.trim() ?? current.proxy,
      timezone: input.timezone?.trim() || current.timezone,
      locale: input.locale?.trim() || current.locale,
      startUrl: input.startUrl?.trim() || current.startUrl,
      updatedAt: Date.now()
    }

    this.db
      .prepare(
        `UPDATE profiles SET
          name = @name,
          proxy = @proxy,
          geoip = @geoip,
          timezone = @timezone,
          locale = @locale,
          platform = @platform,
          screenWidth = @screenWidth,
          screenHeight = @screenHeight,
          hardwareConcurrency = @hardwareConcurrency,
          deviceMemory = @deviceMemory,
          storageQuotaMb = @storageQuotaMb,
          startUrl = @startUrl,
          updatedAt = @updatedAt
        WHERE id = @id`
      )
      .run({ ...next, geoip: next.geoip ? 1 : 0 })

    return next
  }

  touchOpened(id: string): void {
    this.db
      .prepare('UPDATE profiles SET lastOpenedAt = ?, updatedAt = ? WHERE id = ?')
      .run(Date.now(), Date.now(), id)
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM profiles WHERE id = ?').run(id)
  }

  ensureSeedData(): void {
    if (this.list().length > 0) return

    const samples: ProfileInput[] = [
      {
        name: '日本调研环境',
        proxy: 'socks5://45.77.12.34:10001',
        timezone: 'Asia/Tokyo',
        locale: 'ja-JP',
        startUrl: 'https://example.com'
      },
      {
        name: '美国测试环境',
        proxy: 'socks5://104.21.68.17:20002',
        timezone: 'America/New_York',
        locale: 'en-US',
        startUrl: 'https://example.com'
      },
      {
        name: '欧洲店铺环境',
        proxy: 'socks5://185.233.101.55:30003',
        timezone: 'Europe/Berlin',
        locale: 'de-DE',
        startUrl: 'https://example.com'
      },
      {
        name: '本地演示环境',
        proxy: '',
        geoip: false,
        timezone: 'Asia/Shanghai',
        locale: 'zh-CN',
        startUrl: 'https://example.com'
      }
    ]

    samples.forEach((sample) => this.create(sample))
  }
}
