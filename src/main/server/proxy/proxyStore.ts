import type Database from 'better-sqlite3'
import { randomUUID } from 'node:crypto'
import type { ProxyInput, ProxyProtocol, SavedProxy } from './types'

const PROTOCOLS = new Set<ProxyProtocol>(['http', 'https', 'socks4', 'socks5'])

function normalizeHost(value: string): string {
  const host = value.trim().replace(/^\[|\]$/g, '')
  if (!host) throw new Error('请输入代理主机')
  if (host.includes('://') || /[/\s@]/.test(host)) {
    throw new Error('代理主机格式不正确，请只填写域名或 IP')
  }
  return host
}

function normalizePort(value: ProxyInput['port']): number {
  const port = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('代理端口必须是 1 到 65535 之间的整数')
  }
  return port
}

function hostForUrl(host: string): string {
  return host.includes(':') ? `[${host}]` : host
}

export function buildProxyUrl(input: ProxyInput): {
  name: string
  protocol: ProxyProtocol
  host: string
  port: number
  username: string
  password: string
  url: string
} {
  const name = input.name?.trim() || ''
  if (!name) throw new Error('请输入代理名称')

  const protocol = input.protocol?.trim().toLowerCase() as ProxyProtocol
  if (!PROTOCOLS.has(protocol)) throw new Error('请选择有效的代理协议')

  const host = normalizeHost(input.host || '')
  const port = normalizePort(input.port)
  const username = input.username?.trim() || ''
  const password = input.password?.trim() || ''
  if (password && !username) throw new Error('填写密码时必须同时填写用户名')

  const auth = username
    ? `${encodeURIComponent(username)}${password ? `:${encodeURIComponent(password)}` : ''}@`
    : ''
  const url = `${protocol}://${auth}${hostForUrl(host)}:${port}`

  return { name, protocol, host, port, username, password, url }
}

export class ProxyStore {
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  list(): SavedProxy[] {
    return this.db.prepare('SELECT * FROM proxies ORDER BY updatedAt DESC').all() as SavedProxy[]
  }

  create(input: ProxyInput): SavedProxy {
    const normalized = buildProxyUrl(input)
    const now = Date.now()
    const proxy: SavedProxy = {
      id: randomUUID(),
      ...normalized,
      createdAt: now,
      updatedAt: now
    }

    this.db
      .prepare(
        `INSERT INTO proxies (
          id, name, protocol, host, port, username, password, url, createdAt, updatedAt
        ) VALUES (
          @id, @name, @protocol, @host, @port, @username, @password, @url, @createdAt, @updatedAt
        )`
      )
      .run(proxy)

    return proxy
  }

  update(id: string, input: ProxyInput): SavedProxy {
    const existing = this.db.prepare('SELECT * FROM proxies WHERE id = ?').get(id) as
      | SavedProxy
      | undefined
    if (!existing) throw new Error('代理不存在')

    const normalized = buildProxyUrl(input)
    const now = Date.now()
    const proxy: SavedProxy = {
      ...existing,
      ...normalized,
      id,
      createdAt: existing.createdAt,
      updatedAt: now
    }

    this.db
      .prepare(
        `UPDATE proxies
         SET name = @name, protocol = @protocol, host = @host, port = @port,
             username = @username, password = @password, url = @url, updatedAt = @updatedAt
         WHERE id = @id`
      )
      .run(proxy)

    return proxy
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM proxies WHERE id = ?').run(id)
  }
}
