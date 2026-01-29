export interface Note {
  id: string
  title: string
  content: string
  markdown: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface NoteMetadata {
  id: string
  title: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  path: string
  parentId: string | null
  children?: Category[]
}

export type NoteFilters = {
  category?: string
  tags?: string[]
  searchQuery?: string
}
