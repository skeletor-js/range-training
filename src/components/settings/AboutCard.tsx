import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AboutCard() {
  return (
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
  );
}
