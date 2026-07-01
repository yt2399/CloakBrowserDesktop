export type ProxyProtocol = 'http' | 'https' | 'socks4' | 'socks5'

export interface SavedProxy {
  id: string
  name: string
  protocol: ProxyProtocol
  host: string
  port: number
  username: string
  password: string
  url: string
  createdAt: number
  updatedAt: number
}

export interface ProxyInput {
  name?: string
  protocol?: string
  host?: string
  port?: number | string
  username?: string
  password?: string
}
