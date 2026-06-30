export {}

declare global {
  interface Window {
    appInfo: {
      name: string
      apiBaseUrl: string
    }
    appWindow: {
      minimize: () => Promise<void>
      toggleMaximize: () => Promise<boolean>
      close: () => Promise<void>
      isMaximized: () => Promise<boolean>
    }
  }
}
