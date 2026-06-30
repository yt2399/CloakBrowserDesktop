import { Router } from 'express'
import { apiHandler } from '../controllers/apiHandler'
import type { ProfileStore } from '../profile/profileStore'
import type { SessionManager } from '../session/sessionManager'

function getProfileId(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] || ''
  return value || ''
}

export function createProfileRouter(store: ProfileStore, sessions: SessionManager) {
  const router = Router()

  router.get(
    '/profiles',
    apiHandler(() =>
      store.list().map((profile) => ({
        ...profile,
        status: sessions.getStatus(profile.id)
      }))
    )
  )

  router.post(
    '/profiles',
    apiHandler((req) => store.create(req.body ?? {}))
  )

  router.put(
    '/profiles/:id',
    apiHandler((req) => store.update(getProfileId(req.params.id), req.body ?? {}))
  )

  router.delete(
    '/profiles/:id',
    apiHandler(async (req) => {
      const id = getProfileId(req.params.id)
      await sessions.close(id)
      store.delete(id)
      return { id }
    })
  )

  router.post(
    '/profiles/:id/open',
    apiHandler(async (req) => {
      const id = getProfileId(req.params.id)
      const profile = store.get(id)
      if (!profile) throw new Error('环境不存在')
      await sessions.open(profile)
      store.touchOpened(profile.id)
      return { id: profile.id, status: sessions.getStatus(profile.id) }
    })
  )

  router.post(
    '/profiles/:id/close',
    apiHandler(async (req) => {
      const id = getProfileId(req.params.id)
      await sessions.close(id)
      return { id, status: sessions.getStatus(id) }
    })
  )

  router.get(
    '/sessions',
    apiHandler(() => sessions.list())
  )

  return router
}
