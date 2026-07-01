import assert from 'node:assert/strict'
import test from 'node:test'
import { startProfilePolling } from '../src/renderer/src/hooks/profile-polling.ts'

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

test('periodically refreshes profile status and stops after cleanup', async () => {
  let refreshCount = 0
  const stop = startProfilePolling(() => {
    refreshCount += 1
  }, 10)

  await wait(38)
  assert.ok(refreshCount >= 3, `expected at least 3 refreshes, received ${refreshCount}`)

  stop()
  const countAfterStop = refreshCount
  await wait(25)
  assert.equal(refreshCount, countAfterStop)
})

test('does not overlap profile refresh requests', async () => {
  let activeRefreshes = 0
  let maximumActiveRefreshes = 0
  let refreshCount = 0

  const stop = startProfilePolling(async () => {
    refreshCount += 1
    activeRefreshes += 1
    maximumActiveRefreshes = Math.max(maximumActiveRefreshes, activeRefreshes)
    await wait(24)
    activeRefreshes -= 1
  }, 5)

  await wait(65)
  stop()
  await wait(30)

  assert.ok(refreshCount >= 2, `expected repeated refreshes, received ${refreshCount}`)
  assert.equal(maximumActiveRefreshes, 1)
})
