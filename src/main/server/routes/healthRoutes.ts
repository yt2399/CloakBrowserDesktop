import { Router } from 'express'
import { apiHandler } from '../controllers/apiHandler'

export function createHealthRouter() {
  const router = Router()

  router.get(
    '/health',
    apiHandler(() => ({
      status: 'ok',
      service: 'running',
      kernel: 'ready'
    }))
  )

  return router
}
