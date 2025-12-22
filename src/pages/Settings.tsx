import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { exportDatabase, exportAsJSON, importDatabase, getDatabaseStats } from '@/lib/export';
import { useSettingsStore } from '@/stores/settingsStore';
import { InstallPrompt } from '@/components/pwa';
import {
  DatabaseStatsCard,
  ExportSection,
  ImportSection,
  DisplaySettingsCard,
  AboutCard,
  ThemeSettingsCard,
  SessionTemplatesCard,
  DebugPanel,
} from '@/components/settings';

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

  // Settings store
  const {
    highGlareMode,
    soundEnabled,
    hapticEnabled,
    shotDetectionEnabled,
    shotDetectionSensitivity,
    lowStockThreshold,
    lowStockWarningsEnabled,
    debugMode,
    toggleHighGlareMode,
    toggleSound,
    toggleHaptic,
    toggleShotDetection,
    setShotDetectionSensitivity,
    setLowStockThreshold,
    toggleLowStockWarnings,
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

  function handleFileSelect(file: File) {
    setPendingFile(file);
    setShowImportDialog(true);
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

      {/* Debug Panel - Only visible in debug mode */}
      {debugMode && <DebugPanel onRefreshStats={loadStats} />}

      <DatabaseStatsCard stats={stats} />

      <ExportSection
        onExportDB={handleExportDB}
        onExportJSON={handleExportJSON}
        isLoading={isLoading}
      />

      <ImportSection
        isLoading={isLoading}
        showDialog={showImportDialog}
        pendingFile={pendingFile}
        onFileSelect={handleFileSelect}
        onConfirmImport={handleConfirmImport}
        onCancelImport={handleCancelImport}
      />

      {/* Install App */}
      <div className="mb-6">
        <InstallPrompt />
      </div>

      <ThemeSettingsCard />

      <SessionTemplatesCard />

      <DisplaySettingsCard
        highGlareMode={highGlareMode}
        soundEnabled={soundEnabled}
        hapticEnabled={hapticEnabled}
        shotDetectionEnabled={shotDetectionEnabled}
        shotDetectionSensitivity={shotDetectionSensitivity}
        lowStockThreshold={lowStockThreshold}
        lowStockWarningsEnabled={lowStockWarningsEnabled}
        onToggleHighGlare={toggleHighGlareMode}
        onToggleSound={toggleSound}
        onToggleHaptic={toggleHaptic}
        onToggleShotDetection={toggleShotDetection}
        onShotDetectionSensitivityChange={setShotDetectionSensitivity}
        onToggleLowStockWarnings={toggleLowStockWarnings}
        onLowStockThresholdChange={setLowStockThreshold}
      />

      <AboutCard />
    </div>
  );
}
