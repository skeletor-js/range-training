import { useState, useEffect } from 'react';
import { Bug, Database, Trash2, RefreshCw, ChevronDown, ChevronRight, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSettingsStore } from '@/stores/settingsStore';
import { seedTestData, getDatabaseStats, getTableData, resetDatabase } from '@/db/seedTestData';
import { cn } from '@/lib/utils';

interface DebugPanelProps {
  onRefreshStats: () => void;
}

export function DebugPanel({ onRefreshStats }: DebugPanelProps) {
  const { disableDebugMode } = useSettingsStore();

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showGenerateConfirm, setShowGenerateConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown[]>>({});
  const [loadingTable, setLoadingTable] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Auto-clear messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function loadStats() {
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load debug stats:', err);
    }
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setShowGenerateConfirm(false);

    try {
      const counts = await seedTestData();
      setMessage({
        type: 'success',
        text: `Created ${counts.firearms} firearms, ${counts.ammo} ammo types, ${counts.sessions} sessions, ${counts.shots} shots`,
      });
      await loadStats();
      onRefreshStats();
    } catch (err) {
      console.error('Failed to generate test data:', err);
      setMessage({
        type: 'error',
        text: 'Failed to generate test data. Check console for details.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleReset() {
    if (resetConfirmText !== 'RESET') return;

    setIsResetting(true);
    setShowResetConfirm(false);
    setResetConfirmText('');

    try {
      await resetDatabase();
      setMessage({
        type: 'success',
        text: 'All data has been deleted. Built-in drills have been restored.',
      });
      await loadStats();
      onRefreshStats();
      // Clear table data cache
      setTableData({});
      setExpandedTable(null);
    } catch (err) {
      console.error('Failed to reset database:', err);
      setMessage({
        type: 'error',
        text: 'Failed to reset database. Check console for details.',
      });
    } finally {
      setIsResetting(false);
    }
  }

  async function handleExpandTable(tableName: string) {
    if (expandedTable === tableName) {
      setExpandedTable(null);
      return;
    }

    setExpandedTable(tableName);

    // Load data if not cached
    if (!tableData[tableName]) {
      setLoadingTable(tableName);
      try {
        const data = await getTableData(tableName);
        setTableData(prev => ({ ...prev, [tableName]: data }));
      } catch (err) {
        console.error(`Failed to load ${tableName}:`, err);
        setMessage({
          type: 'error',
          text: `Failed to load ${tableName} data`,
        });
      } finally {
        setLoadingTable(null);
      }
    }
  }

  function handleDisableDebug() {
    disableDebugMode();
  }

  const tables = [
    'firearms', 'ammo', 'ammo_purchases', 'sessions', 'session_firearms',
    'session_ammo', 'targets', 'shots', 'drills', 'drill_attempts',
    'drill_benchmarks', 'goals', 'ranges', 'session_templates', 'malfunctions'
  ];

  const totalRecords = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-500">
          <Bug className="h-5 w-5" />
          Debug Mode
          <Badge variant="outline" className="ml-2 text-yellow-500 border-yellow-500">
            DEV
          </Badge>
        </CardTitle>
        <CardDescription>
          Developer tools for testing - use with caution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Message */}
        {message && (
          <div
            className={cn(
              'p-3 rounded-lg text-sm',
              message.type === 'success' && 'bg-green-500/10 text-green-500 border border-green-500/30',
              message.type === 'error' && 'bg-destructive/10 text-destructive border border-destructive/30'
            )}
          >
            {message.text}
          </div>
        )}

        {/* Generate Test Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Generate Test Data</Label>
              <p className="text-xs text-muted-foreground">
                Creates 12 firearms, 18 ammo types, 60 sessions, 120+ drill attempts
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowGenerateConfirm(true)}
              disabled={isGenerating || isResetting}
              className="border-yellow-500/50 hover:bg-yellow-500/10"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </div>

        {/* Database Reset */}
        <div className="space-y-2 pt-4 border-t border-destructive/30">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base text-destructive">Reset Database</Label>
              <p className="text-xs text-muted-foreground">
                Deletes ALL data and reinitializes the database
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowResetConfirm(true)}
              disabled={isGenerating || isResetting}
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Reset
            </Button>
          </div>
        </div>

        {/* Extended Stats */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-base">Database Statistics</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadStats}
              className="h-8 px-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {Object.entries(stats).map(([table, count]) => (
              <div key={table} className="flex justify-between px-2 py-1 bg-muted/30 rounded">
                <span className="text-muted-foreground text-xs truncate">{table.replace(/_/g, ' ')}</span>
                <span className="font-mono text-xs">{count}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Total records: {totalRecords.toLocaleString()}
          </p>
        </div>

        {/* Raw Data Viewer */}
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-base">Raw Data Viewer</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Click a table to view its contents (limited to 100 records)
          </p>
          <div className="space-y-1">
            {tables.map(table => (
              <div key={table}>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-9 px-3"
                  onClick={() => handleExpandTable(table)}
                >
                  <span className="font-mono text-sm">{table}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {stats[table] || 0}
                    </Badge>
                    {loadingTable === table ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : expandedTable === table ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </Button>
                {expandedTable === table && (
                  <div className="h-48 overflow-auto rounded border bg-muted/30 p-2 mt-1">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {tableData[table]
                        ? JSON.stringify(tableData[table], null, 2)
                        : 'Loading...'}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Disable Debug Mode */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDisableDebug}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Disable Debug Mode
          </Button>
        </div>
      </CardContent>

      {/* Generate Confirmation Dialog */}
      <AlertDialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Test Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will add fake data to your database including firearms, ammunition,
              sessions, targets, shots, and drill attempts. Existing data will NOT be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerate}>
              Generate Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete ALL your data including sessions,
              firearms, ammunition inventory, drill history, and goals.
              <br /><br />
              Built-in drills will be restored after reset.
              <br /><br />
              <strong>Type RESET to confirm:</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={resetConfirmText}
            onChange={(e) => setResetConfirmText(e.target.value)}
            placeholder="Type RESET to confirm"
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetConfirmText('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={resetConfirmText !== 'RESET'}
              onClick={handleReset}
              className={cn(
                'bg-destructive hover:bg-destructive/90',
                resetConfirmText !== 'RESET' && 'opacity-50 cursor-not-allowed'
              )}
            >
              Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
