import { BrowserWindow } from 'electron'
import NoteService from './NoteService'

/**
 * 导出服务
 * 负责将笔记导出为 PDF、HTML 和 Markdown 格式
 */
class ExportService {
  /**
   * 导出笔记为 PDF
   * @param noteId 笔记 ID
   * @returns PDF 文件的 Buffer
   */
  async exportToPDF(noteId: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const note = await NoteService.getNote(noteId)
        if (!note) {
          reject(new Error('Note not found'))
          return
        }

        // 创建隐藏窗口用于 PDF 生成
        const win = new BrowserWindow({
          show: false,
          webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
          }
        })

        // 生成 HTML 内容
        const html = this.generateHTML(note)

        win.webContents.on('did-finish-load', async () => {
          try {
            const pdfBuffer = await win.webContents.printToPDF({
              pageSize: 'A4',
              printBackground: true,
              marginsType: 0
            })

            win.close()
            resolve(pdfBuffer)
          } catch (error) {
            win.close()
            reject(error)
          }
        })

        win.webContents.on('did-fail-load', () => {
          win.close()
          reject(new Error('Failed to load content'))
        })

        // 加载 HTML 内容
        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 导出笔记为 HTML
   * @param noteId 笔记 ID
   * @returns HTML 字符串
   */
  async exportToHTML(noteId: string): Promise<string> {
    const note = await NoteService.getNote(noteId)
    if (!note) {
      throw new Error('Note not found')
    }

    return this.generateHTML(note)
  }

  /**
   * 导出笔记为 Markdown
   * @param noteId 笔记 ID
   * @returns Markdown 字符串
   */
  async exportToMarkdown(noteId: string): Promise<string> {
    const note = await NoteService.getNote(noteId)
    if (!note) {
      throw new Error('Note not found')
    }

    return note.markdown
  }

  /**
   * 批量导出笔记为 PDF
   * @param noteIds 笔记 ID 数组
   * @returns PDF 文件的 Buffer 数组
   */
  async batchExportToPDF(noteIds: string[]): Promise<Buffer[]> {
    const pdfs: Buffer[] = []

    for (const id of noteIds) {
      try {
        const pdf = await this.exportToPDF(id)
        pdfs.push(pdf)
      } catch (error) {
        console.error(`Error exporting note ${id} to PDF:`, error)
      }
    }

    return pdfs
  }

  /**
   * 生成笔记的 HTML 表示
   * @param note 笔记对象
   * @returns HTML 字符串
   */
  private generateHTML(note: any): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(note.title)}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: white;
            color: #333;
        }
        h1 {
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .meta {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 20px;
        }
        .tag {
            display: inline-block;
            background: #e1f5fe;
            padding: 2px 8px;
            border-radius: 3px;
            margin-right: 5px;
            font-size: 0.85em;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        code {
            font-family: 'Courier New', monospace;
            background: #f5f5f5;
            padding: 2px 5px;
            border-radius: 3px;
        }
        pre code {
            background: none;
            padding: 0;
        }
        blockquote {
            border-left: 4px solid #ddd;
            padding-left: 20px;
            margin-left: 0;
            color: #666;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        table th,
        table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        table th {
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <h1>${this.escapeHtml(note.title)}</h1>
    <div class="meta">
        <p><strong>Category:</strong> ${this.escapeHtml(note.category)}</p>
        <p><strong>Created:</strong> ${new Date(note.createdAt).toLocaleString()}</p>
        <p><strong>Modified:</strong> ${new Date(note.updatedAt).toLocaleString()}</p>
        ${note.tags.length > 0 ? '<p><strong>Tags:</strong> ' +
          note.tags.map((tag: string) => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('') +
          '</p>' : ''}
    </div>
    <hr>
    <div class="content">
        ${this.markdownToHTML(note.markdown)}
    </div>
</body>
</html>
    `
  }

  /**
   * 转义 HTML 特殊字符
   * @param text 要转义的文本
   * @returns 转义后的文本
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
  }

  /**
   * 将 Markdown 转换为 HTML
   * 简单的转换实现，生产环境建议使用 marked 或 markdown-it 等库
   * @param markdown Markdown 文本
   * @returns HTML 字符串
   */
  private markdownToHTML(markdown: string): string {
    // 简单的 markdown 到 HTML 转换
    // 生产环境建议使用 marked 或 markdown-it 等成熟的库
    let html = markdown

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')

    // 行内代码
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // 粗体和斜体
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')

    // 图片
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">')

    // 引用块
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

    // 无序列表
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')

    // 有序列表
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

    // 换行
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'

    // 清理空段落
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>(<h[1-6]>)/g, '$1')
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    html = html.replace(/<p>(<pre>)/g, '$1')
    html = html.replace(/(<\/pre>)<\/p>/g, '$1')
    html = html.replace(/<p>(<blockquote>)/g, '$1')
    html = html.replace(/(<\/blockquote>)<\/p>/g, '$1')
    html = html.replace(/<p>(<ul>)/g, '$1')
    html = html.replace(/(<\/ul>)<\/p>/g, '$1')

    return html
  }
}

export default new ExportService()
