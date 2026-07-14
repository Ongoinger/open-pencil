const STORAGE_KEY = 'localStorage'

type WindowWithStorage = Window & typeof globalThis & Record<typeof STORAGE_KEY, Storage>

export function installWindowStorage(storage: Storage): void {
  const nextWindow = { [STORAGE_KEY]: storage } as WindowWithStorage
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    writable: true,
    value: nextWindow
  })
}

export function uninstallWindowStorage(): void {
  Reflect.deleteProperty(globalThis, 'window')
}
