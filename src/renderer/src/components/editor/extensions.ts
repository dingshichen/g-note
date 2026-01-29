import { Extension } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

// Create lowlight instance with common languages
const lowlight = createLowlight(common)

// Custom extension for auto-saving
export const AutoSaveExtension = Extension.create({
  name: 'autoSave',

  addStorage() {
    return {
      debounceTimer: null as NodeJS.Timeout | null,
      debounceTime: 3000 // 3 seconds
    }
  },

  onUpdate() {
    // Clear previous timer
    if (this.storage.debounceTimer) {
      clearTimeout(this.storage.debounceTimer)
    }

    // Set new timer
    this.storage.debounceTimer = setTimeout(() => {
      // Emit custom event for auto-save
      window.dispatchEvent(new CustomEvent('editor:auto-save'))
    }, this.storage.debounceTime)
  }
})

// Export all extensions
export const extensions = [
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return 'Heading...'
      }
      return "Write your note... Use '/' for commands"
    }
  }),
  Image.configure({
    inline: true,
    allowBase64: true
  }),
  Link.configure({
    openOnClick: false
  }),
  Table.configure({
    resizable: true
  }),
  TableRow,
  TableHeader,
  TableCell,
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'plaintext'
  }),
  AutoSaveExtension
]
