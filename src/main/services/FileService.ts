import { app } from 'electron'
import { join } from 'path'
import { promises as fs } from 'fs'
import { existsSync } from 'fs'

/**
 * 文件服务
 * 负责文件的读写、删除和目录管理
 */
class FileService {
  private userDataPath: string

  constructor() {
    this.userDataPath = app.getPath('userData')
    this.ensureDirectories()
  }

  /**
   * 确保必要的目录存在
   * 如果目录不存在则创建
   */
  private ensureDirectories() {
    const dirs = [
      join(this.userDataPath, 'notes'),
      join(this.userDataPath, 'categories'),
      join(this.userDataPath, 'assets'),
      join(this.userDataPath, '.git')
    ]

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        fs.mkdir(dir, { recursive: true }).catch(console.error)
      }
    })
  }

  /**
   * 读取文件内容
   * @param filePath 文件相对路径
   * @returns 文件内容字符串
   */
  async readFile(filePath: string): Promise<string> {
    try {
      const fullPath = join(this.userDataPath, filePath)
      return await fs.readFile(fullPath, 'utf-8')
    } catch (error) {
      console.error('Error reading file:', error)
      throw error
    }
  }

  /**
   * 写入文件内容
   * @param filePath 文件相对路径
   * @param content 要写入的内容
   */
  async writeFile(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = join(this.userDataPath, filePath)
      const dir = join(fullPath, '..')
      if (!existsSync(dir)) {
        await fs.mkdir(dir, { recursive: true })
      }
      await fs.writeFile(fullPath, content, 'utf-8')
    } catch (error) {
      console.error('Error writing file:', error)
      throw error
    }
  }

  /**
   * 删除文件
   * @param filePath 文件相对路径
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = join(this.userDataPath, filePath)
      if (existsSync(fullPath)) {
        await fs.unlink(fullPath)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw error
    }
  }

  /**
   * 列出目录中的文件
   * @param dirPath 目录相对路径
   * @returns 文件名数组，只包含 .md 和 .json 文件
   */
  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const fullPath = join(this.userDataPath, dirPath)
      if (!existsSync(fullPath)) {
        return []
      }
      const files = await fs.readdir(fullPath)
      return files.filter(file => file.endsWith('.md') || file.endsWith('.json'))
    } catch (error) {
      console.error('Error listing files:', error)
      return []
    }
  }

  /**
   * 检查文件是否存在
   * @param filePath 文件相对路径
   * @returns 文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = join(this.userDataPath, filePath)
    return existsSync(fullPath)
  }

  /**
   * 保存资源文件（图片等）
   * @param fileName 文件名
   * @param data 文件数据
   * @returns 资源文件访问路径
   */
  async saveAsset(fileName: string, data: Buffer): Promise<string> {
    const assetsDir = join(this.userDataPath, 'assets')
    if (!existsSync(assetsDir)) {
      await fs.mkdir(assetsDir, { recursive: true })
    }
    const filePath = join(assetsDir, fileName)
    await fs.writeFile(filePath, data)
    return `assets:///${fileName}`
  }

  /**
   * 获取资源文件的完整路径
   * @param fileName 文件名
   * @returns 完整路径
   */
  getAssetPath(fileName: string): string {
    return join(this.userDataPath, 'assets', fileName)
  }

  /**
   * 获取笔记目录的完整路径
   * @returns 笔记目录路径
   */
  getNotesPath(): string {
    return join(this.userDataPath, 'notes')
  }

  /**
   * 获取用户数据目录路径
   * @returns 用户数据目录路径
   */
  getUserDataPath(): string {
    return this.userDataPath
  }
}

export default new FileService()
