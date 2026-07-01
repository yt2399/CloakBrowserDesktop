import assert from 'node:assert/strict'
import test from 'node:test'
import { buildProxyUrl } from '../src/main/server/proxy/proxyStore.ts'

test('builds an authenticated proxy URL from structured fields', () => {
  const proxy = buildProxyUrl({
    name: '日本住宅代理',
    protocol: 'socks5',
    host: 'proxy.example.com',
    port: 1080,
    username: 'user@example.com',
    password: 'p@ss word'
  })

  assert.equal(
    proxy.url,
    'socks5://user%40example.com:p%40ss%20word@proxy.example.com:1080'
  )
})

test('wraps an IPv6 proxy host in brackets', () => {
  const proxy = buildProxyUrl({
    name: 'IPv6 代理',
    protocol: 'http',
    host: '2001:db8::1',
    port: 8080
  })

  assert.equal(proxy.url, 'http://[2001:db8::1]:8080')
})

test('rejects malformed structured proxy fields', () => {
  assert.throws(
    () =>
      buildProxyUrl({
        name: '无效代理',
        protocol: 'socks5',
        host: 'https://proxy.example.com',
        port: 70000
      }),
    /主机格式不正确/
  )

  assert.throws(
    () =>
      buildProxyUrl({
        name: '无效代理',
        protocol: 'socks5',
        host: 'proxy.example.com',
        port: 1080,
        password: 'secret'
      }),
    /必须同时填写用户名/
  )
})
