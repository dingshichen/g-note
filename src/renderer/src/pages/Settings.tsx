import { useState, useEffect } from 'react'
import { useUIStore } from '../stores/uiStore'
import ThemeToggle from '../components/common/ThemeToggle'
import { Save, RefreshCw, Github, Folder, Copy, ExternalLink } from 'lucide-react'

interface GitRemoteSettings {
  url: string
  token: string
  branch: string
}

export default function Settings() {
  const { theme } = useUIStore()
  const [gitSettings, setGitSettings] = useState<GitRemoteSettings>({
    url: '',
    token: '',
    branch: 'main'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [userDataPath, setUserDataPath] = useState<string>('')
  const [copyMessage, setCopyMessage] = useState('')

  // Load saved settings and user data path
  useEffect(() => {
    const savedGitSettings = localStorage.getItem('gitSettings')
    if (savedGitSettings) {
      setGitSettings(JSON.parse(savedGitSettings))
    }

    // Get user data path
    const fetchUserDataPath = async () => {
      try {
        const response = await window.api.fs.getUserDataPath()
        if (response.success && response.data) {
          setUserDataPath(response.data.path)
        }
      } catch (error) {
        console.error('Failed to get user data path:', error)
      }
    }

    fetchUserDataPath()
  }, [])

  const handleGitSettingsSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      localStorage.setItem('gitSettings', JSON.stringify(gitSettings))
      setSaveMessage('Settings saved successfully!')
    } catch (err) {
      setSaveMessage('Failed to save settings')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(''), 3000)
    }
  }

  const handlePush = async () => {
    if (!gitSettings.url || !gitSettings.token) {
      alert('Please configure Git remote settings first')
      return
    }

    try {
      const response = await window.api.git.push(
        gitSettings.url,
        gitSettings.token,
        gitSettings.branch
      )

      if (response.success) {
        alert('Pushed to remote repository successfully!')
      } else {
        alert(response.error || 'Failed to push')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handlePull = async () => {
    if (!gitSettings.url || !gitSettings.token) {
      alert('Please configure Git remote settings first')
      return
    }

    try {
      const response = await window.api.git.pull(
        gitSettings.url,
        gitSettings.token,
        gitSettings.branch
      )

      if (response.success) {
        alert('Pulled from remote repository successfully!')
        window.location.reload() // Reload to refresh notes
      } else {
        alert(response.error || 'Failed to pull')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleCopyPath = async () => {
    if (userDataPath) {
      try {
        await navigator.clipboard.writeText(userDataPath)
        setCopyMessage('Path copied to clipboard!')
        setTimeout(() => setCopyMessage(''), 2000)
      } catch (err) {
        console.error('Failed to copy path:', err)
        setCopyMessage('Failed to copy path')
        setTimeout(() => setCopyMessage(''), 2000)
      }
    }
  }

  const handleOpenFolder = async () => {
    try {
      const response = await window.api.fs.openFolder(userDataPath)
      if (!response.success) {
        console.error('Failed to open folder:', response.error)
        setCopyMessage('Failed to open folder')
        setTimeout(() => setCopyMessage(''), 2000)
      }
    } catch (err) {
      console.error('Failed to open folder:', err)
      setCopyMessage('Failed to open folder')
      setTimeout(() => setCopyMessage(''), 2000)
    }
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Theme Settings */}
        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Theme:</span>
            <ThemeToggle />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Current theme: {theme === 'system' ? 'System' : theme}
          </p>
        </div>

        {/* Storage Settings */}
        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Storage
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Your notes are stored locally in the following directory:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userDataPath || 'Loading...'}
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-muted text-muted-foreground"
              />
              <button
                onClick={handleCopyPath}
                className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-accent transition-colors"
                title="Copy path to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenFolder}
                className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-accent transition-colors"
                title="Open folder in file explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            
            {copyMessage && (
              <p className="text-sm text-green-600">{copyMessage}</p>
            )}
            
            <div className="text-xs text-muted-foreground">
              <p>This directory contains:</p>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• notes/ - All your note files in Markdown format</li>
                <li>• .git/ - Version control history</li>
                <li>• categories/ - Category definitions</li>
                <li>• assets/ - Images and other media files</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Git Settings */}
        <div className="mb-8 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Github className="w-5 h-5" />
            Git Remote
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Configure your Git remote repository to sync your notes.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Repository URL</label>
              <input
                type="text"
                value={gitSettings.url}
                onChange={(e) => setGitSettings({ ...gitSettings, url: e.target.value })}
                placeholder="https://github.com/username/repo.git"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Access Token</label>
              <input
                type="password"
                value={gitSettings.token}
                onChange={(e) => setGitSettings({ ...gitSettings, token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxx"
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                For GitHub: Create a personal access token with repo permissions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <input
                type="text"
                value={gitSettings.branch}
                onChange={(e) => setGitSettings({ ...gitSettings, branch: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGitSettingsSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>

              <button
                onClick={handlePush}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Push to Remote
              </button>

              <button
                onClick={handlePull}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Pull from Remote
              </button>
            </div>

            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </p>
            )}
          </div>
        </div>

        {/* About */}
        <div className="p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">About G-Note</h2>
          <p className="text-sm text-muted-foreground">
            G-Note is a modern desktop note-taking application with Git version control.
            <br />
            Version: 0.1.0
            <br />
            Built with Electron + React + TypeScript + TipTap
          </p>
        </div>
      </div>
    </div>
  )
}
