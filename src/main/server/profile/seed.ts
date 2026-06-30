export function createProfileSeed(id: string): string {
  return `profile_${id.replace(/[^A-Za-z0-9_-]/g, '_')}`
}

export function createProfileId(): string {
  return globalThis.crypto.randomUUID()
}
