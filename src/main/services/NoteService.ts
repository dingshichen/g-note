import { format } from 'date-fns'
import FileService from './FileService'
import type { Note, NoteMetadata } from '../../renderer/src/types/note'

/**
 * 生成简单的 UUID
 */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 笔记服务
 * 负责笔记的创建、保存、查询、更新和删除
 */
class NoteService {
  /**
   * 创建新笔记
   * @param title 笔记标题，默认为 "Untitled Note"
   * @returns 创建的笔记对象
   */
  async createNote(title: string = 'Untitled Note'): Promise<Note> {
    const id = generateId()
    const now = new Date().toISOString()

    const note: Note = {
      id,
      title,
      content: '',
      markdown: '',
      category: 'Uncategorized',
      tags: [],
      createdAt: now,
      updatedAt: now
    }

    await this.saveNote(note)
    return note
  }

  /**
   * 保存笔记到文件
   * 使用 frontmatter 格式保存元数据和内容
   * @param note 要保存的笔记对象
   */
  async saveNote(note: Note): Promise<void> {
    const filePath = `notes/${note.id}.md`

    // 保存为 Markdown 格式，包含 frontmatter 元数据
    const frontmatter = `---
title: ${note.title}
category: ${note.category}
tags: ${JSON.stringify(note.tags)}
createdAt: ${note.createdAt}
updatedAt: ${note.updatedAt}
---

${note.markdown}
`

    await FileService.writeFile(filePath, frontmatter)
  }

  /**
   * 根据 ID 获取笔记
   * @param id 笔记 ID
   * @returns 笔记对象，如果不存在则返回 null
   */
  async getNote(id: string): Promise<Note | null> {
    try {
      const filePath = `notes/${id}.md`
      const content = await FileService.readFile(filePath)

      return this.parseNote(id, content)
    } catch (error) {
      console.error('Error getting note:', error)
      return null
    }
  }

  /**
   * 获取所有笔记
   * @returns 笔记数组，按更新时间降序排列
   */
  async getAllNotes(): Promise<Note[]> {
    try {
      const files = await FileService.listFiles('notes')
      const notes: Note[] = []

      for (const file of files) {
        const id = file.replace('.md', '')
        const note = await this.getNote(id)
        if (note) {
          notes.push(note)
        }
      }

      // 按更新时间降序排序
      return notes.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } catch (error) {
      console.error('Error getting all notes:', error)
      return []
    }
  }

  /**
   * 获取所有笔记的元数据（不包含内容）
   * @returns 笔记元数据数组
   */
  async getNotesMetadata(): Promise<NoteMetadata[]> {
    try {
      const notes = await this.getAllNotes()
      return notes.map(note => ({
        id: note.id,
        title: note.title,
        category: note.category,
        tags: note.tags,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    } catch (error) {
      console.error('Error getting notes metadata:', error)
      return []
    }
  }

  /**
   * 更新笔记
   * @param id 笔记 ID
   * @param updates 要更新的字段
   * @returns 更新后的笔记对象，如果笔记不存在则返回 null
   */
  async updateNote(id: string, updates: Partial<Note>): Promise<Note | null> {
    const note = await this.getNote(id)
    if (!note) return null

    const updatedNote = {
      ...note,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.saveNote(updatedNote)
    return updatedNote
  }

  /**
   * 删除笔记
   * @param id 笔记 ID
   */
  async deleteNote(id: string): Promise<void> {
    await FileService.deleteFile(`notes/${id}.md`)
  }

  /**
   * 解析笔记内容
   * 从 frontmatter 格式的文件中提取元数据和内容
   * @param id 笔记 ID
   * @param content 文件内容
   * @returns 解析后的笔记对象
   */
  private parseNote(id: string, content: string): Note {
    // 解析 frontmatter 元数据
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    const match = content.match(frontmatterRegex)

    if (match) {
      const frontmatter = match[1]
      const markdown = match[2]

      /**
       * 解析 frontmatter 文本
       * @param text frontmatter 文本内容
       * @returns 解析后的数据对象
       */
      const parseFrontmatter = (text: string) => {
        const lines = text.split('\n')
        const data: any = {}

        for (const line of lines) {
          const [key, ...valueParts] = line.split(':')
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim()
            if (key === 'tags') {
              try {
                data[key] = JSON.parse(value)
              } catch {
                data[key] = []
              }
            } else {
              data[key] = value
            }
          }
        }

        return data
      }

      const data = parseFrontmatter(frontmatter)

      return {
        id,
        title: data.title || 'Untitled',
        content: markdown, // 在实际应用中，应将 markdown 转换为 HTML
        markdown: markdown.trim(),
        category: data.category || 'Uncategorized',
        tags: data.tags || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      }
    }

    // 没有 frontmatter，将整个内容作为 markdown 处理
    return {
      id,
      title: 'Untitled',
      content,
      markdown: content,
      category: 'Uncategorized',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * 搜索笔记
   * 在标题、内容和标签中搜索关键词
   * @param query 搜索关键词
   * @returns 匹配的笔记数组
   */
  async searchNotes(query: string): Promise<Note[]> {
    const notes = await this.getAllNotes()
    const lowerQuery = query.toLowerCase()

    return notes.filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.markdown.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
}

export default new NoteService()
