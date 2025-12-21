import { useRef } from 'react';
import { Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImportSectionProps {
  isLoading: boolean;
  showDialog: boolean;
  pendingFile: File | null;
  onFileSelect: (file: File) => void;
  onConfirmImport: () => void;
  onCancelImport: () => void;
}

export function ImportSection({
  isLoading,
  showDialog,
  pendingFile,
  onFileSelect,
  onConfirmImport,
  onCancelImport,
}: ImportSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }

  return (
    <>
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
            onChange={handleFileChange}
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

      {/* Import Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => !open && onCancelImport()}>
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
            <Button variant="outline" onClick={onCancelImport}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmImport}>
              Replace My Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
