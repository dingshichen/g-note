"use strict";
const electron = require("electron");
const api = {
  notes: {
    list: () => electron.ipcRenderer.invoke("notes:list"),
    get: (id) => electron.ipcRenderer.invoke("notes:get", id),
    create: (title) => electron.ipcRenderer.invoke("notes:create", title),
    update: (id, updates) => electron.ipcRenderer.invoke("notes:update", id, updates),
    delete: (id) => electron.ipcRenderer.invoke("notes:delete", id),
    metadata: () => electron.ipcRenderer.invoke("notes:metadata")
  },
  git: {
    history: (noteId, limit) => electron.ipcRenderer.invoke("git:history", noteId, limit),
    commit: (noteId, message) => electron.ipcRenderer.invoke("git:commit", noteId, message),
    checkout: (noteId, hash) => electron.ipcRenderer.invoke("git:checkout", noteId, hash),
    diff: (noteId, hash1, hash2) => electron.ipcRenderer.invoke("git:diff", noteId, hash1, hash2),
    push: (remoteUrl, token, branch) => electron.ipcRenderer.invoke("git:push", remoteUrl, token, branch),
    pull: (remoteUrl, token, branch) => electron.ipcRenderer.invoke("git:pull", remoteUrl, token, branch),
    snapshot: (name) => electron.ipcRenderer.invoke("git:snapshot", name),
    snapshots: () => electron.ipcRenderer.invoke("git:snapshots")
  },
  fs: {
    saveAsset: (fileName, buffer) => electron.ipcRenderer.invoke("fs:save-asset", fileName, buffer),
    getAssetPath: (fileName) => electron.ipcRenderer.invoke("fs:get-asset-path", fileName),
    selectFile: () => electron.ipcRenderer.invoke("fs:select-file"),
    saveFileDialog: (defaultName) => electron.ipcRenderer.invoke("fs:save-file-dialog", defaultName),
    readFile: (filePath) => electron.ipcRenderer.invoke("fs:read-file", filePath),
    writeFile: (filePath, content) => electron.ipcRenderer.invoke("fs:write-file", filePath, content),
    exists: (filePath) => electron.ipcRenderer.invoke("fs:exists", filePath),
    getUserDataPath: () => electron.ipcRenderer.invoke("fs:get-user-data-path")
  },
  search: {
    query: (query) => electron.ipcRenderer.invoke("search:query", query),
    queryWithHighlight: (query) => electron.ipcRenderer.invoke("search:query-highlight", query),
    rebuildIndex: () => electron.ipcRenderer.invoke("search:rebuild-index")
  },
  export: {
    pdf: (noteId) => electron.ipcRenderer.invoke("export:pdf", noteId),
    html: (noteId) => electron.ipcRenderer.invoke("export:html", noteId),
    markdown: (noteId) => electron.ipcRenderer.invoke("export:markdown", noteId),
    batchPdf: (noteIds) => electron.ipcRenderer.invoke("export:batch-pdf", noteIds)
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.api = api;
}
