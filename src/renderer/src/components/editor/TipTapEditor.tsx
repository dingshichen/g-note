import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { extensions } from './extensions'
import { useEffect, useRef } from 'react'
import Toolbar from './Toolbar'
import type { Note } from '../../types/note'

/**
 * TipTap 编辑器组件属性
 */
interface TipTapEditorProps {
  note: Note // 当前笔记对象
  onUpdate: (updates: Partial<Note>) => void // 更新回调函数
  readOnly?: boolean // 是否只读模式
}

/**
 * TipTap 富文本编辑器组件
 * 提供笔记的富文本编辑功能，支持自动保存
 */
export default function TipTapEditor({ note, onUpdate, readOnly = false }: TipTapEditorProps) {
  // 自动保存定时器引用
  const saveRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化编辑器
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false // 禁用默认代码块，使用 lowlight 版本
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      ...extensions
    ],
    content: note.markdown || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const markdown = editor.getText() // 实际应用中应使用合适的 markdown 序列化器
      const html = editor.getHTML()

      // 防抖保存（3秒后自动保存）
      if (saveRef.current) {
        clearTimeout(saveRef.current)
      }

      saveRef.current = setTimeout(() => {
        onUpdate({
          markdown: editor.getText(),
          content: html
        })
      }, 3000)
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-4 py-3'
      }
    }
  })

  // 当笔记变化时更新编辑器内容
  useEffect(() => {
    if (editor && note.markdown !== editor.getText()) {
      editor.commands.setContent(note.markdown || '', false)
    }
  }, [note.id, editor])

  // 处理自动保存事件
  useEffect(() => {
    const handleAutoSave = () => {
      if (editor) {
        onUpdate({
          markdown: editor.getText(),
          content: editor.getHTML()
        })
      }
    }

    window.addEventListener('editor:auto-save', handleAutoSave)
    return () => {
      window.removeEventListener('editor:auto-save', handleAutoSave)
      if (saveRef.current) {
        clearTimeout(saveRef.current)
      }
    }
  }, [editor, onUpdate])

  // 编辑器加载中显示加载动画
  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 渲染编辑器
  return (
    <div className="flex flex-col h-full">
      {!readOnly && <Toolbar editor={editor} />}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
