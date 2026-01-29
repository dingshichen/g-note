import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'

interface Category {
  id: string
  name: string
  children?: Category[]
}

const defaultCategories: Category[] = [
  {
    id: 'all',
    name: 'All Notes'
  },
  {
    id: 'uncategorized',
    name: 'Uncategorized'
  },
  {
    id: 'tech',
    name: 'Technology',
    children: [
      { id: 'tech-react', name: 'React' },
      { id: 'tech-vue', name: 'Vue' },
      { id: 'tech-electron', name: 'Electron' }
    ]
  },
  {
    id: 'personal',
    name: 'Personal',
    children: [
      { id: 'personal-journal', name: 'Journal' },
      { id: 'personal-ideas', name: 'Ideas' }
    ]
  }
]

export default function CategoryTree() {
  const [categories] = useState(defaultCategories)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['tech', 'personal']))
  const [selected, setSelected] = useState('all')

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expanded.has(category.id)
    const isSelected = selected === category.id

    return (
      <div key={category.id}>
        <button
          onClick={() => {
            setSelected(category.id)
            if (hasChildren) {
              toggleExpand(category.id)
            }
          }}
          className={`w-full flex items-center gap-1 px-2 py-1 text-sm rounded-md transition-colors ${
            isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3 h-3 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
            )
          ) : (
            <div className="w-3" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 flex-shrink-0" />
          )}
          <span className="truncate">{category.name}</span>
        </button>

        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-0.5">
      {categories.map((category) => renderCategory(category))}
    </div>
  )
}
