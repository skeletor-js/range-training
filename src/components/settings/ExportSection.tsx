import { Download, Database, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExportSectionProps {
  onExportDB: () => void;
  onExportJSON: () => void;
  isLoading: boolean;
}

export function ExportSection({ onExportDB, onExportJSON, isLoading }: ExportSectionProps) {
  return (
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
          onClick={onExportDB}
          disabled={isLoading}
          className="w-full justify-start"
          variant="outline"
        >
          <Database className="h-4 w-4 mr-2" />
          Export Database (.db)
        </Button>
        <Button
          onClick={onExportJSON}
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
  );
}
