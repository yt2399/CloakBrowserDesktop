import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('appInfo', {
  name: 'CloakBrowserApp',
  apiBaseUrl: 'http://127.0.0.1:6788/api'
})

contextBridge.exposeInMainWorld('appWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  toggleMaximize: () => ipcRenderer.invoke('window:toggle-maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:is-maximized')
})

contextBridge.exposeInMainWorld('kernelReleases', {
  list: (force = false) => ipcRenderer.invoke('kernels:list-releases', force),
  installationStatus: () => ipcRenderer.invoke('kernels:installation-status'),
  installedVersions: () => ipcRenderer.invoke('kernels:installed-versions') as Promise<string[]>,
  revealVersion: (payload: { version: string; edition: 'free' | 'pro' }) =>
    ipcRenderer.invoke('kernels:reveal-version', payload) as Promise<void>
})

interface WorkspacePaths {
  workspaceDirectory: string
  kernelDirectory: string
  profilesDirectory: string
}

contextBridge.exposeInMainWorld('workspace', {
  getPaths: () => ipcRenderer.invoke('workspace:get-paths') as Promise<WorkspacePaths>,
  chooseDirectory: () =>
    ipcRenderer.invoke('workspace:choose-directory') as Promise<WorkspacePaths | null>,
  revealWorkspace: () => ipcRenderer.invoke('workspace:reveal-workspace') as Promise<void>
})
