import type { Request, Response } from 'express'
import { BasicsResult } from './BasicsResult'

export type ApiHandler = (req: Request) => Promise<unknown> | unknown

export function apiHandler(handler: ApiHandler) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await handler(req)
      res.json(BasicsResult.success(data))
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求处理失败'
      res.status(500).json(BasicsResult.error(500, message))
    }
  }
}
