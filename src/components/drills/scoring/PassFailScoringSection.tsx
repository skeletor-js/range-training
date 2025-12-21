import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface PassFailScoringProps {
  passed: boolean | null;
  error?: string;
  onChange: (passed: boolean) => void;
}

export function PassFailScoringSection({
  passed,
  error,
  onChange,
}: PassFailScoringProps) {
  return (
    <div className="flex items-center space-x-3">
      <Label htmlFor="passed">Did you pass?</Label>
      <Switch
        id="passed"
        checked={passed ?? false}
        onCheckedChange={onChange}
      />
      <span className="text-sm text-muted-foreground">
        {passed ? 'Pass' : 'Fail'}
      </span>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
