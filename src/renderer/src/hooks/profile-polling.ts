export function startProfilePolling(
  refresh: () => void | Promise<void>,
  intervalMs: number
): () => void {
  let stopped = false
  let refreshing = false

  const run = async () => {
    if (stopped || refreshing) return
    refreshing = true
    try {
      await refresh()
    } catch {
      // A transient refresh failure must not stop future polling attempts.
    } finally {
      refreshing = false
    }
  }

  void run()
  const timer = globalThis.setInterval(() => {
    void run()
  }, intervalMs)

  return () => {
    stopped = true
    globalThis.clearInterval(timer)
  }
}
