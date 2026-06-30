export type ProfileStatus = 'running' | 'stopped'

export interface BrowserProfile {
  id: string
  name: string
  seed: string
  userDataDir: string
  proxy: string
  geoip: boolean
  timezone: string
  locale: string
  platform: 'windows' | 'macos' | 'linux'
  screenWidth: number
  screenHeight: number
  hardwareConcurrency: number
  deviceMemory: number
  storageQuotaMb: number
  startUrl: string
  createdAt: number
  updatedAt: number
  lastOpenedAt: number | null
  status: ProfileStatus
}

export type ProfileInput = Partial<
  Pick<
    BrowserProfile,
    | 'name'
    | 'proxy'
    | 'geoip'
    | 'timezone'
    | 'locale'
    | 'platform'
    | 'screenWidth'
    | 'screenHeight'
    | 'hardwareConcurrency'
    | 'deviceMemory'
    | 'storageQuotaMb'
    | 'startUrl'
  >
>

export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
  succeed: boolean
  timestamp: number
}
