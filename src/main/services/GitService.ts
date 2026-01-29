import * as git from 'isomorphic-git'
import { fs } from 'isomorphic-git'
import FileService from './FileService'
import type { GitCommit } from '../../renderer/src/types/git'

/**
 * Git 服务
 * 负责笔记的版本控制、历史记录、远程同步等功能
 */
class GitService {
  private repoDir: string
  private initialized: boolean = false

  constructor() {
    this.repoDir = FileService.getUserDataPath()
  }

  /**
   * 确保 Git 仓库已初始化
   * 如果仓库不存在则创建新仓库
   */
  private async ensureInitialized() {
    if (this.initialized) return

    try {
      // 检查是否已经是 Git 仓库
      try {
        const gitRoot = await git.findRoot({ fs, dir: this.repoDir })
        console.log('Git repository already exists at:', gitRoot)
      } catch (e) {
        // 不是仓库，初始化新仓库
        await git.init({
          fs,
          dir: this.repoDir,
          defaultBranch: 'main'
        })
        console.log('Git repository initialized')
      }
      this.initialized = true
    } catch (error) {
      console.error('Error initializing git repo:', error)
    }
  }

  /**
   * 自动提交笔记更改
   * @param noteId 笔记 ID
   * @param message 提交消息，可选
   * @returns 提交的哈希值，失败返回 null
   */
  async autoCommit(noteId: string, message?: string): Promise<string | null> {
    try {
      await this.ensureInitialized()

      const note = await FileService.readFile(`notes/${noteId}.md`)
      const timestamp = new Date().toISOString()
      const commitMessage = message || `Auto-save note ${noteId} at ${timestamp}`

      // 添加笔记文件到暂存区
      await git.add({
        fs,
        dir: this.repoDir,
        filepath: `notes/${noteId}.md`
      })

      // 提交更改
      const commitHash = await git.commit({
        fs,
        dir: this.repoDir,
        message: commitMessage,
        author: {
          name: 'G-Note',
          email: 'g-note@localhost'
        }
      })

      console.log('Auto-commit successful:', commitHash)
      return commitHash
    } catch (error) {
      console.error('Error auto-committing:', error)
      return null
    }
  }

  /**
   * 获取笔记的提交历史
   * @param noteId 笔记 ID
   * @param limit 返回的历史记录数量限制
   * @returns 提交历史数组
   */
  async getHistory(noteId: string, limit: number = 20): Promise<GitCommit[]> {
    try {
      await this.ensureInitialized()

      const log = await git.log({
        fs,
        dir: this.repoDir,
        filepath: `notes/${noteId}.md`,
        depth: limit
      })

      return log.map(commit => ({
        hash: commit.oid,
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author.name || 'G-Note',
        timestamp: commit.commit.author.timestamp || Date.now() / 1000,
        noteId
      }))
    } catch (error) {
      console.error('Error getting history:', error)
      return []
    }
  }

  /**
   * 检出指定版本的笔记内容
   * @param noteId 笔记 ID
   * @param commitHash 提交哈希值
   * @returns 检出后的内容，失败返回 null
   */
  async checkoutVersion(noteId: string, commitHash: string): Promise<string | null> {
    try {
      await this.ensureInitialized()

      // 从提交中获取内容
      const { content } = await git.readBlob({
        fs,
        dir: this.repoDir,
        oid: commitHash,
        filepath: `notes/${noteId}.md`
      })

      // 解码并写回文件
      const contentStr = Buffer.from(content).toString('utf-8')
      await FileService.writeFile(`notes/${noteId}.md`, contentStr)

      console.log('Checked out version:', commitHash)
      return contentStr
    } catch (error) {
      console.error('Error checking out version:', error)
      return null
    }
  }

  /**
   * 获取两个提交之间的差异
   * @param noteId 笔记 ID
   * @param commitHash1 第一个提交哈希值
   * @param commitHash2 第二个提交哈希值
   * @returns 包含新旧内容的对象
   */
  async getDiff(noteId: string, commitHash1: string, commitHash2: string): Promise<any> {
    try {
      await this.ensureInitialized()

      // 简单的差异实现，可以进一步增强
      const content1 = await git.readBlob({
        fs,
        dir: this.repoDir,
        oid: commitHash1,
        filepath: `notes/${noteId}.md`
      })

      const content2 = await git.readBlob({
        fs,
        dir: this.repoDir,
        oid: commitHash2,
        filepath: `notes/${noteId}.md`
      })

      return {
        oldContent: Buffer.from(content1.content).toString('utf-8'),
        newContent: Buffer.from(content2.content).toString('utf-8')
      }
    } catch (error) {
      console.error('Error getting diff:', error)
      return null
    }
  }

  /**
   * 推送到远程仓库
   * @param remoteUrl 远程仓库 URL
   * @param token 访问令牌
   * @param branch 分支名称，默认为 main
   * @returns 是否成功
   */
  async push(remoteUrl: string, token: string, branch: string = 'main'): Promise<boolean> {
    try {
      await this.ensureInitialized()

      // 如果远程不存在则添加
      const remotes = await git.listRemotes({ fs, dir: this.repoDir })
      const hasOrigin = remotes.some(r => r.remote === 'origin')

      if (!hasOrigin) {
        await git.addRemote({
          fs,
          dir: this.repoDir,
          remote: 'origin',
          url: remoteUrl
        })
      }

      // Push to remote
      await git.push({
        fs,
        http: require('isomorphic-git/http/node'),
        dir: this.repoDir,
        remote: 'origin',
        branch: branch,
        onAuth: () => ({ username: token, password: '' })
      })

      console.log('Push successful')
      return true
    } catch (error) {
      console.error('Error pushing:', error)
      return false
    }
  }

  /**
   * 从远程仓库拉取
   * @param remoteUrl 远程仓库 URL
   * @param token 访问令牌
   * @param branch 分支名称，默认为 main
   * @returns 是否成功
   */
  async pull(remoteUrl: string, token: string, branch: string = 'main'): Promise<boolean> {
    try {
      await this.ensureInitialized()

      await git.pull({
        fs,
        http: require('isomorphic-git/http/node'),
        dir: this.repoDir,
        remote: 'origin',
        branch: branch,
        onAuth: () => ({ username: token, password: '' }),
        singleBranch: true
      })

      console.log('Pull successful')
      return true
    } catch (error) {
      console.error('Error pulling:', error)
      return false
    }
  }

  /**
   * 创建快照（使用 Git 标签）
   * @param name 快照名称
   * @returns 标签名称，失败返回 null
   */
  async createSnapshot(name: string): Promise<string | null> {
    try {
      await this.ensureInitialized()

      const tagName = `snapshot-${Date.now()}`

      await git.tag({
        fs,
        dir: this.repoDir,
        ref: tagName,
        message: name
      })

      console.log('Snapshot created:', tagName)
      return tagName
    } catch (error) {
      console.error('Error creating snapshot:', error)
      return null
    }
  }

  /**
   * 获取所有快照列表
   * @returns 快照数组，包含名称和哈希值
   */
  async getSnapshots(): Promise<Array<{ name: string; hash: string }>> {
    try {
      await this.ensureInitialized()

      const tags = await git.listTags({ fs, dir: this.repoDir })
      const snapshots = []

      for (const tag of tags) {
        if (tag.startsWith('snapshot-')) {
          const ref = await git.resolveRef({ fs, dir: this.repoDir, ref: tag })
          snapshots.push({ name: tag, hash: ref })
        }
      }

      return snapshots
    } catch (error) {
      console.error('Error getting snapshots:', error)
      return []
    }
  }
}

export default new GitService()
