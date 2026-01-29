import type { Note, NoteMetadata } from '../renderer/src/types/note'
import type { GitCommit } from '../renderer/src/types/git'

interface API {
  notes: {
    list: () => Promise<{ success: boolean; data?: Note[]; error?: string }>
    get: (id: string) => Promise<{ success: boolean; data?: Note; error?: string }>
    create: (title?: string) => Promise<{ success: boolean; data?: Note; error?: string }>
    update: (id: string, updates: Partial<Note>) => Promise<{ success: boolean; data?: Note; error?: string }>
    delete: (id: string) => Promise<{ success: boolean; error?: string }>
    metadata: () => Promise<{ success: boolean; data?: NoteMetadata[]; error?: string }>
  }

  git: {
    history: (noteId: string, limit?: number) => Promise<{ success: boolean; data?: GitCommit[]; error?: string }>
    commit: (noteId: string, message?: string) => Promise<{ success: boolean; data?: { hash: string }; error?: string }>
    checkout: (noteId: string, hash: string) => Promise<{ success: boolean; data?: { content: string }; error?: string }>
    diff: (noteId: string, hash1: string, hash2: string) => Promise<{ success: boolean; data?: any; error?: string }>
    push: (remoteUrl: string, token: string, branch?: string) => Promise<{ success: boolean; error?: string }>
    pull: (remoteUrl: string, token: string, branch?: string) => Promise<{ success: boolean; error?: string }>
    snapshot: (name: string) => Promise<{ success: boolean; data?: { tagName: string }; error?: string }>
    snapshots: () => Promise<{ success: boolean; data?: Array<{ name: string; hash: string }>; error?: string }>
  }

  fs: {
    saveAsset: (fileName: string, buffer: ArrayBuffer) => Promise<{ success: boolean; data?: { url: string }; error?: string }>
    getAssetPath: (fileName: string) => Promise<{ success: boolean; data?: { path: string }; error?: string }>
    selectFile: () => Promise<{ success: boolean; data?: { filePath: string }; error?: string }>
    saveFileDialog: (defaultName: string) => Promise<{ success: boolean; data?: { filePath: string }; error?: string }>
    readFile: (filePath: string) => Promise<{ success: boolean; data?: { content: string }; error?: string }>
    writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>
    exists: (filePath: string) => Promise<{ success: boolean; data?: { exists: boolean }; error?: string }>
    getUserDataPath: () => Promise<{ success: boolean; data?: { path: string }; error?: string }>
  }

  search: {
    query: (query: string) => Promise<{ success: boolean; data?: Note[]; error?: string }>
    queryWithHighlight: (query: string) => Promise<{ success: boolean; data?: Array<{ note: Note; matches: string[] }>; error?: string }>
    rebuildIndex: () => Promise<{ success: boolean; error?: string }>
  }

  export: {
    pdf: (noteId: string) => Promise<{ success: boolean; data?: { pdf: Buffer }; error?: string }>
    html: (noteId: string) => Promise<{ success: boolean; data?: { html: string }; error?: string }>
    markdown: (noteId: string) => Promise<{ success: boolean; data?: { markdown: string }; error?: string }>
    batchPdf: (noteIds: string[]) => Promise<{ success: boolean; data?: { pdfs: Buffer[] }; error?: string }>
  }
}

declare global {
  interface Window {
    api: API
  }
}
