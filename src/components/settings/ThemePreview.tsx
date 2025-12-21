import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function ThemePreview() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Theme Preview</h3>
        <Badge variant="secondary">New</Badge>
      </div>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1">Primary</Button>
        <Button size="sm" variant="secondary" className="flex-1">Secondary</Button>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1">Outline</Button>
        <Button size="sm" variant="destructive" className="flex-1">Destructive</Button>
      </div>

      <div className="p-3 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground">
          This is muted text on a muted background.
        </p>
      </div>

      <div className="p-3 bg-accent rounded-md">
        <p className="text-xs text-accent-foreground">
          This is accent text on an accent background.
        </p>
      </div>
    </Card>
  );
}
