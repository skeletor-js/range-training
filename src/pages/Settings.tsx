import { useState, useRef, useEffect } from 'react';
import { Download, Upload, FileJson, Database, AlertTriangle, Sun, Volume2, Vibrate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportDatabase, exportAsJSON, importDatabase, getDatabaseStats } from '@/lib/export';
import { useSettingsStore } from '@/stores/settingsStore';

interface DatabaseStats {
  firearms: number;
  ammo: number;
  sessions: number;
  targets: number;
  shots: number;
  drills: number;
}

export function Settings() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings store
  const {
    highGlareMode,
    soundEnabled,
    hapticEnabled,
    toggleHighGlareMode,
    toggleSound,
    toggleHaptic,
  } = useSettingsStore();

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }

  async function handleExportDB() {
    setIsLoading(true);
    setError(null);
    try {
      await exportDatabase();
    } catch (err) {
      setError('Failed to export database');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportJSON() {
    setIsLoading(true);
    setError(null);
    try {
      await exportAsJSON();
    } catch (err) {
      setError('Failed to export as JSON');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowImportDialog(true);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }

  async function handleConfirmImport() {
    if (!pendingFile) return;

    setIsLoading(true);
    setError(null);
    setShowImportDialog(false);

    try {
      await importDatabase(pendingFile);
      // Page will reload after import
    } catch (err) {
      setError((err as Error).message || 'Failed to import database');
      console.error(err);
      setIsLoading(false);
    }

    setPendingFile(null);
  }

  function handleCancelImport() {
    setShowImportDialog(false);
    setPendingFile(null);
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Database Stats */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database
          </CardTitle>
          <CardDescription>
            Your data is stored locally on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Firearms</p>
                <p className="text-lg font-semibold">{stats.firearms}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ammo Types</p>
                <p className="text-lg font-semibold">{stats.ammo}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sessions</p>
                <p className="text-lg font-semibold">{stats.sessions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Targets</p>
                <p className="text-lg font-semibold">{stats.targets}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shots</p>
                <p className="text-lg font-semibold">{stats.shots}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Drills</p>
                <p className="text-lg font-semibold">{stats.drills}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading...</p>
          )}
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Back up your data to your device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={handleExportDB}
            disabled={isLoading}
            className="w-full justify-start"
            variant="outline"
          >
            <Database className="h-4 w-4 mr-2" />
            Export Database (.db)
          </Button>
          <Button
            onClick={handleExportJSON}
            disabled={isLoading}
            className="w-full justify-start"
            variant="outline"
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <p className="text-xs text-muted-foreground">
            The .db file is a complete backup. JSON is human-readable but cannot be imported back.
          </p>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore from a previous backup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".db,.sqlite,.sqlite3"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={handleImportClick}
            disabled={isLoading}
            className="w-full justify-start"
            variant="outline"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Database (.db)
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Importing will replace all current data with the backup.
          </p>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Display
          </CardTitle>
          <CardDescription>
            Adjust display settings for different environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-glare">High-Glare Mode</Label>
              <p className="text-xs text-muted-foreground">
                Larger touch targets and higher contrast for outdoor use
              </p>
            </div>
            <Switch
              id="high-glare"
              checked={highGlareMode}
              onCheckedChange={toggleHighGlareMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sound">Sound Effects</Label>
            </div>
            <Switch
              id="sound"
              checked={soundEnabled}
              onCheckedChange={toggleSound}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="haptic">Haptic Feedback</Label>
            </div>
            <Switch
              id="haptic"
              checked={hapticEnabled}
              onCheckedChange={toggleHaptic}
            />
          </div>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><span className="font-medium text-foreground">Range App</span> v0.1.0</p>
          <p>Track your range sessions, manage ammunition, and measure improvement over time.</p>
          <p>All data is stored locally on your device. No accounts, no cloud, no tracking.</p>
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Import
            </DialogTitle>
            <DialogDescription>
              Importing a database will replace <strong>all</strong> your current data.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              <span className="font-medium">File:</span>{' '}
              <span className="text-muted-foreground">{pendingFile?.name}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Size:</span>{' '}
              <span className="text-muted-foreground">
                {pendingFile ? (pendingFile.size / 1024).toFixed(1) : 0} KB
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelImport}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmImport}>
              Replace My Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
