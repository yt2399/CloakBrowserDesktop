import { Router } from 'express'
import { apiHandler } from '../controllers/apiHandler'
import type { ProxyStore } from '../proxy/proxyStore'

function getProxyId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export function createProxyRouter(store: ProxyStore) {
  const router = Router()

  router.get(
    '/proxies',
    apiHandler(() => store.list())
  )

  router.post(
    '/proxies',
    apiHandler((req) => store.create(req.body ?? {}))
  )

  router.put(
    '/proxies/:id',
    apiHandler((req) => {
      const id = getProxyId(req.params.id)
      if (!id) throw new Error('代理不存在')
      return store.update(id, req.body ?? {})
    })
  )

  router.delete(
    '/proxies/:id',
    apiHandler((req) => {
      const id = getProxyId(req.params.id)
      if (!id) throw new Error('代理不存在')
      store.delete(id)
      return { id }
    })
  )

  return router
}
