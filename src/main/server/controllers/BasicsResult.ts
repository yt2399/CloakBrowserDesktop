export class BasicsResult {
  code: number
  msg: string
  data: unknown
  succeed: boolean
  timestamp: number

  private constructor(code: number, msg: string, data: unknown, succeed: boolean) {
    this.code = code
    this.msg = msg
    this.data = data
    this.succeed = succeed
    this.timestamp = Date.now()
  }

  static success(data: unknown): BasicsResult {
    return new BasicsResult(200, '成功', data, true)
  }

  static error(code: number, msg: string): BasicsResult {
    return new BasicsResult(code, msg, null, false)
  }
}
