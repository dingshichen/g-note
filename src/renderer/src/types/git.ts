export interface GitCommit {
  hash: string
  message: string
  author: string
  timestamp: number
  noteId: string
}

export interface GitDiff {
  oldContent: string
  newContent: string
  changes: DiffChange[]
}

export interface DiffChange {
  type: 'added' | 'removed' | 'modified'
  content: string
  lineNumber: number
}

export interface GitRemote {
  url: string
  token: string
  branch: string
}
