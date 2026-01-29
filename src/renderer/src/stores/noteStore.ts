import { create } from 'zustand'
import type { Note } from '../types/note'

/**
 * 笔记状态管理接口
 */
interface NoteState {
  notes: Note[]
  currentNote: Note | null
  isLoading: boolean
  error: string | null

  // 操作方法
  setNotes: (notes: Note[]) => void
  setCurrentNote: (note: Note | null) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  removeNote: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 异步操作方法
  fetchNotes: () => Promise<void>
  fetchNote: (id: string) => Promise<void>
  createNote: (title?: string) => Promise<Note | null>
  saveNote: (id: string, updates: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
}

export const useNoteStore = create<NoteState>((set, get) => ({
  // 初始状态
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  // 同步操作方法
  setNotes: (notes) => set({ notes }),

  setCurrentNote: (note) => set({ currentNote: note }),

  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),

  updateNote: (id, updates) =>
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...updates } : note
      ),
      currentNote:
        state.currentNote?.id === id
          ? { ...state.currentNote, ...updates }
          : state.currentNote
    })),

  removeNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNote: state.currentNote?.id === id ? null : state.currentNote
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  // 异步操作方法
  /**
   * 获取所有笔记列表
   */
  fetchNotes: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.notes.list()
      if (response.success && response.data) {
        set({ notes: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch notes', isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * 根据 ID 获取单个笔记
   */
  fetchNote: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.notes.get(id)
      if (response.success && response.data) {
        set({ currentNote: response.data, isLoading: false })
      } else {
        set({ error: response.error || 'Failed to fetch note', isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * 创建新笔记
   */
  createNote: async (title) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.notes.create(title)
      if (response.success && response.data) {
        set((state) => ({
          notes: [response.data!, ...state.notes],
          currentNote: response.data!,
          isLoading: false
        }))
        return response.data
      } else {
        set({ error: response.error || 'Failed to create note', isLoading: false })
        return null
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      return null
    }
  },

  /**
   * 保存笔记更新
   */
  saveNote: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.notes.update(id, updates)
      if (response.success && response.data) {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id ? response.data! : note
          ),
          currentNote:
            state.currentNote?.id === id
              ? response.data!
              : state.currentNote,
          isLoading: false
        }))
      } else {
        set({ error: response.error || 'Failed to save note', isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  /**
   * 删除笔记
   */
  deleteNote: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const response = await window.api.notes.delete(id)
      if (response.success) {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
          isLoading: false
        }))
      } else {
        set({ error: response.error || 'Failed to delete note', isLoading: false })
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  }
}))
