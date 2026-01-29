import { useState } from 'react'
import { ArrowLeft, ArrowRight, Compare } from 'lucide-react'

interface DiffViewerProps {
  noteId: string
  commits: Array<{ hash: string; message: string; timestamp: number }>
}

export default function DiffViewer({ noteId, commits }: DiffViewerProps) {
  const [leftCommit, setLeftCommit] = useState(commits[1]?.hash || '')
  const [rightCommit, setRightCommit] = useState(commits[0]?.hash || '')
  const [diff, setDiff] = useState<{ oldContent: string; newContent: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCompare = async () => {
    if (!leftCommit || !rightCommit) return

    setIsLoading(true)
    try {
      const response = await window.api.git.diff(noteId, leftCommit, rightCommit)
      if (response.success && response.data) {
        setDiff(response.data)
      }
    } catch (err) {
      console.error('Error loading diff:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (commits.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Compare className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Need at least 2 versions to compare</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Compare Versions</h3>

      {/* Version selectors */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">From</label>
          <select
            value={leftCommit}
            onChange={(e) => setLeftCommit(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            {commits.slice(1).map((commit) => (
              <option key={commit.hash} value={commit.hash}>
                {commit.message} ({new Date(commit.timestamp * 1000).toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCompare}
          disabled={isLoading}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Compare'}
        </button>

        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">To</label>
          <select
            value={rightCommit}
            onChange={(e) => setRightCommit(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-background"
          >
            {commits.map((commit) => (
              <option key={commit.hash} value={commit.hash}>
                {commit.message} ({new Date(commit.timestamp * 1000).toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diff display */}
      {diff && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Old Version
            </h4>
            <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {diff.oldContent}
            </pre>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              New Version
            </h4>
            <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {diff.newContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
