import FlexSearch from 'flexsearch'
import NoteService from './NoteService'
import type { Note } from '../../renderer/src/types/note'

/**
 * 搜索服务
 * 使用 FlexSearch 提供全文搜索功能
 */
class SearchService {
  private index: any
  private indexedNotes: Set<string> = new Set()

  constructor() {
    // 创建文档索引
    this.index = new FlexSearch.Document({
      document: {
        id: 'id',
        index: ['title', 'content', 'tags'],
        store: true
      },
      tokenize: 'full'
    })

    this.buildIndex()
  }

  /**
   * 构建搜索索引
   * 从所有现有笔记构建初始索引
   */
  private async buildIndex() {
    try {
      const notes = await NoteService.getAllNotes()

      for (const note of notes) {
        await this.indexNote(note)
      }

      console.log('Search index built with', notes.length, 'notes')
    } catch (error) {
      console.error('Error building search index:', error)
    }
  }

  /**
   * 将笔记添加到搜索索引
   * @param note 要索引的笔记
   */
  async indexNote(note: Note): Promise<void> {
    try {
      if (!this.indexedNotes.has(note.id)) {
        await this.index.add({
          id: note.id,
          title: note.title,
          content: note.markdown,
          tags: note.tags.join(' ')
        })

        this.indexedNotes.add(note.id)
      }
    } catch (error) {
      console.error('Error indexing note:', error)
    }
  }

  /**
   * 更新笔记的搜索索引
   * @param note 要更新的笔记
   */
  async updateNoteIndex(note: Note): Promise<void> {
    try {
      await this.index.update({
        id: note.id,
        title: note.title,
        content: note.markdown,
        tags: note.tags.join(' ')
      })
    } catch (error) {
      console.error('Error updating note index:', error)
    }
  }

  /**
   * 从搜索索引中移除笔记
   * @param noteId 笔记 ID
   */
  async removeFromIndex(noteId: string): Promise<void> {
    try {
      await this.index.remove(noteId)
      this.indexedNotes.delete(noteId)
    } catch (error) {
      console.error('Error removing from index:', error)
    }
  }

  /**
   * 搜索笔记
   * @param query 搜索关键词
   * @returns 匹配的笔记数组
   */
  async search(query: string): Promise<Note[]> {
    try {
      if (!query || query.trim().length === 0) {
        return await NoteService.getAllNotes()
      }

      const results = await this.index.search(query, {
        limit: 50,
        enrich: true
      })

      const noteIds = new Set<string>()
      const uniqueResults: Note[] = []

      // 从结果中提取唯一的笔记 ID
      for (const result of results) {
        for (const field of result.result) {
          noteIds.add(field.id)
        }
      }

      // 获取完整的笔记对象
      for (const id of noteIds) {
        const note = await NoteService.getNote(id)
        if (note) {
          uniqueResults.push(note)
        }
      }

      return uniqueResults
    } catch (error) {
      console.error('Error searching:', error)
      return []
    }
  }

  /**
   * 搜索笔记并高亮显示匹配内容
   * @param query 搜索关键词
   * @returns 包含笔记和匹配内容的数组
   */
  async searchWithHighlight(query: string): Promise<Array<{ note: Note; matches: string[] }>> {
    try {
      const notes = await this.search(query)
      const lowerQuery = query.toLowerCase()

      return notes.map(note => {
        const matches: string[] = []

        // 查找匹配的上下文
        if (note.title.toLowerCase().includes(lowerQuery)) {
          matches.push(note.title)
        }

        const lines = note.markdown.split('\n')
        for (const line of lines) {
          if (line.toLowerCase().includes(lowerQuery)) {
            matches.push(line.trim())
          }
        }

        return { note, matches: matches.slice(0, 5) } // 限制匹配数量
      })
    } catch (error) {
      console.error('Error searching with highlight:', error)
      return []
    }
  }
}

export default new SearchService()
