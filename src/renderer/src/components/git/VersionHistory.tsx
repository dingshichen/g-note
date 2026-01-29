import { useState, useEffect } from 'react'
import { GitCommit, RotateCcw, Clock } from 'lucide-react'
import type { GitCommit as GitCommitType } from '../../types/git'
import { format } from 'date-fns'

interface VersionHistoryProps {
  noteId: string
  onRestore: (hash: string) => void
}

export default function VersionHistory({ noteId, onRestore }: VersionHistoryProps) {
  const [history, setHistory] = useState<GitCommitType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
  }, [noteId])

  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await window.api.git.history(noteId, 20)
      if (response.success && response.data) {
        setHistory(response.data)
      } else {
        setError(response.error || 'Failed to fetch history')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (hash: string) => {
    if (!confirm('Are you sure you want to restore this version? This will create a new commit.')) {
      return
    }

    try {
      const response = await window.api.git.checkout(noteId, hash)
      if (response.success) {
        onRestore(hash)
        await fetchHistory() // Refresh history
      } else {
        alert(response.error || 'Failed to restore version')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
        <button
          onClick={fetchHistory}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No version history yet</p>
        <p className="text-xs">History is created when you save notes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Version History</h3>
      <div className="space-y-2">
        {history.map((commit, index) => (
          <div
            key={commit.hash}
            className="border rounded-lg p-4 hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <GitCommit className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-sm">
                    {index === 0 ? 'Current Version' : `Version ${history.length - index}`}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{commit.message}</p>
                <div className="text-xs text-muted-foreground">
                  <div>{commit.author}</div>
                  <div>{format(new Date(commit.timestamp * 1000), 'PPpp')}</div>
                  <div className="font-mono">{commit.hash.slice(0, 7)}</div>
                </div>
              </div>
              {index > 0 && (
                <button
                  onClick={() => handleRestore(commit.hash)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  title="Restore this version"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
