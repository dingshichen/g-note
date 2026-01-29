import { useUIStore } from '../../stores/uiStore'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useUIStore()

  return (
    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-background/50'
        }`}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-background/50'
        }`}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system' ? 'bg-background text-foreground' : 'text-muted-foreground hover:bg-background/50'
        }`}
        title="System theme"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  )
}
