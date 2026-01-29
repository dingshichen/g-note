import { X } from 'lucide-react'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  noteTitle?: string
}

export default function DeleteConfirmDialog({ 
  open, 
  onOpenChange, 
  onConfirm,
  noteTitle 
}: DeleteConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog */}
      <div className="relative bg-background border rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        
        {/* Content */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Delete Note</h2>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{noteTitle || 'this note'}"? This action cannot be undone.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}