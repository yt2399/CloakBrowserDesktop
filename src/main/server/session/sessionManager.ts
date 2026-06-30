import type { BrowserContext } from 'playwright-core'
import type { BrowserProfile, ProfileStatus } from '../profile/types'

type CloakBrowserModule = {
  launchPersistentContext(options: {
    userDataDir: string
    headless?: boolean
    proxy?: string
    geoip?: boolean
    timezone?: string
    locale?: string
    args?: string[]
  }): Promise<BrowserContext>
}

export class SessionManager {
  private contexts = new Map<string, BrowserContext>()

  getStatus(profileId: string): ProfileStatus {
    return this.contexts.has(profileId) ? 'running' : 'stopped'
  }

  list() {
    return Array.from(this.contexts.keys()).map((profileId) => ({
      profileId,
      status: 'running' as const
    }))
  }

  async open(profile: BrowserProfile): Promise<void> {
    if (this.contexts.has(profile.id)) return

    const args = [
      `--fingerprint=${profile.seed}`,
      `--fingerprint-platform=${profile.platform}`,
      `--fingerprint-storage-quota=${profile.storageQuotaMb}`,
      `--fingerprint-screen-width=${profile.screenWidth}`,
      `--fingerprint-screen-height=${profile.screenHeight}`,
      `--fingerprint-hardware-concurrency=${profile.hardwareConcurrency}`,
      `--fingerprint-device-memory=${profile.deviceMemory}`
    ]

    const cloak = (await import('cloakbrowser')) as CloakBrowserModule
    const context = await cloak.launchPersistentContext({
      userDataDir: profile.userDataDir,
      headless: false,
      proxy: profile.proxy || undefined,
      geoip: Boolean(profile.proxy && profile.geoip),
      timezone: profile.timezone,
      locale: profile.locale,
      args
    })

    this.contexts.set(profile.id, context)

    const existing = context.pages()[0]
    const page = existing || (await context.newPage())
    await page.goto(profile.startUrl, { waitUntil: 'domcontentloaded' })

    context.on('close', () => {
      this.contexts.delete(profile.id)
    })
  }

  async close(profileId: string): Promise<void> {
    const context = this.contexts.get(profileId)
    if (!context) return
    this.contexts.delete(profileId)
    await context.close()
  }

  async closeAll(): Promise<void> {
    await Promise.all(Array.from(this.contexts.keys()).map((id) => this.close(id)))
  }
}
