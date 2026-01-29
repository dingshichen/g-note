import { contextBridge, ipcRenderer } from 'electron'

// Custom API
const api = {
  notes: {
    list: () => ipcRenderer.invoke('notes:list'),
    get: (id: string) => ipcRenderer.invoke('notes:get', id),
    create: (title?: string) => ipcRenderer.invoke('notes:create', title),
    update: (id: string, updates: any) => ipcRenderer.invoke('notes:update', id, updates),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    metadata: () => ipcRenderer.invoke('notes:metadata')
  },

  git: {
    history: (noteId: string, limit?: number) =>
      ipcRenderer.invoke('git:history', noteId, limit),
    commit: (noteId: string, message?: string) =>
      ipcRenderer.invoke('git:commit', noteId, message),
    checkout: (noteId: string, hash: string) =>
      ipcRenderer.invoke('git:checkout', noteId, hash),
    diff: (noteId: string, hash1: string, hash2: string) =>
      ipcRenderer.invoke('git:diff', noteId, hash1, hash2),
    push: (remoteUrl: string, token: string, branch?: string) =>
      ipcRenderer.invoke('git:push', remoteUrl, token, branch),
    pull: (remoteUrl: string, token: string, branch?: string) =>
      ipcRenderer.invoke('git:pull', remoteUrl, token, branch),
    snapshot: (name: string) =>
      ipcRenderer.invoke('git:snapshot', name),
    snapshots: () =>
      ipcRenderer.invoke('git:snapshots')
  },

  fs: {
    saveAsset: (fileName: string, buffer: ArrayBuffer) =>
      ipcRenderer.invoke('fs:save-asset', fileName, buffer),
    getAssetPath: (fileName: string) =>
      ipcRenderer.invoke('fs:get-asset-path', fileName),
    selectFile: () =>
      ipcRenderer.invoke('fs:select-file'),
    saveFileDialog: (defaultName: string) =>
      ipcRenderer.invoke('fs:save-file-dialog', defaultName),
    readFile: (filePath: string) =>
      ipcRenderer.invoke('fs:read-file', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:write-file', filePath, content),
    exists: (filePath: string) =>
      ipcRenderer.invoke('fs:exists', filePath),
    getUserDataPath: () =>
      ipcRenderer.invoke('fs:get-user-data-path')
  },

  search: {
    query: (query: string) => ipcRenderer.invoke('search:query', query),
    queryWithHighlight: (query: string) =>
      ipcRenderer.invoke('search:query-highlight', query),
    rebuildIndex: () => ipcRenderer.invoke('search:rebuild-index')
  },

  export: {
    pdf: (noteId: string) => ipcRenderer.invoke('export:pdf', noteId),
    html: (noteId: string) => ipcRenderer.invoke('export:html', noteId),
    markdown: (noteId: string) => ipcRenderer.invoke('export:markdown', noteId),
    batchPdf: (noteIds: string[]) => ipcRenderer.invoke('export:batch-pdf', noteIds)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to renderer
// only if context isolation is enabled, otherwise just add to the DOM prototype
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}
