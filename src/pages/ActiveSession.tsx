import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Target,
  MapPin,
  Calendar,
  Thermometer,
  StickyNote
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useActiveSessionStore } from '@/stores/activeSessionStore';
import { useInventoryStore } from '@/stores/inventoryStore';

export function ActiveSession() {
  const navigate = useNavigate();
  const {
    activeSession,
    updateActiveSession,
    saveSession,
    discardSession,
    addFirearmToSession,
    removeFirearmFromSession,
    removeTarget
  } = useActiveSessionStore();

  const { firearms, loadFirearms } = useInventoryStore();

  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const [isAddFirearmOpen, setIsAddFirearmOpen] = useState(false);
  const [selectedFirearmId, setSelectedFirearmId] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadFirearms();
  }, [loadFirearms]);

  useEffect(() => {
    // Redirect if no active session
    if (!activeSession) {
      navigate('/sessions');
    }
  }, [activeSession, navigate]);

  if (!activeSession) {
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);
    const sessionId = await saveSession();
    setIsSaving(false);
    if (sessionId) {
      navigate(`/sessions/${sessionId}`);
    }
  };

  const handleDiscard = () => {
    discardSession();
    navigate('/sessions');
  };

  const handleAddFirearm = () => {
    if (selectedFirearmId) {
      addFirearmToSession(selectedFirearmId);
      setIsAddFirearmOpen(false);
      setSelectedFirearmId('');
    }
  };

  const availableFirearms = firearms.filter(
    f => !activeSession.firearms.some(af => af.firearmId === f.id)
  );

  const getFirearmName = (id: string) => {
    return firearms.find(f => f.id === id)?.name || 'Unknown Firearm';
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <PageHeader
        title="Active Session"
        description="Record your training session"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDiscardDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Discard
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Finish'}
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-9"
                    value={activeSession.date}
                    onChange={(e) => updateActiveSession({ date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Range name"
                    className="pl-9"
                    value={activeSession.location}
                    onChange={(e) => updateActiveSession({ location: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temp (°F)</Label>
                <div className="relative">
                  <Thermometer className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="temperature"
                    type="number"
                    className="pl-9"
                    value={activeSession.temperature || ''}
                    onChange={(e) => updateActiveSession({ temperature: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weather">Weather</Label>
                <Select
                  value={activeSession.weather || ''}
                  onValueChange={(value) => updateActiveSession({ weather: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sunny">Sunny</SelectItem>
                    <SelectItem value="Cloudy">Cloudy</SelectItem>
                    <SelectItem value="Rain">Rain</SelectItem>
                    <SelectItem value="Snow">Snow</SelectItem>
                    <SelectItem value="Windy">Windy</SelectItem>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <div className="relative">
                <StickyNote className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  placeholder="Session notes..."
                  className="pl-9 min-h-[80px]"
                  value={activeSession.notes}
                  onChange={(e) => updateActiveSession({ notes: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Firearms Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Firearms</CardTitle>
            <Dialog open={isAddFirearmOpen} onOpenChange={setIsAddFirearmOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Firearm to Session</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Select value={selectedFirearmId} onValueChange={setSelectedFirearmId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select firearm..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFirearms.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableFirearms.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      No more firearms available to add.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleAddFirearm} disabled={!selectedFirearmId}>
                    Add Firearm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {activeSession.firearms.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                No firearms added yet.
              </div>
            ) : (
              <div className="space-y-2">
                {activeSession.firearms.map((af) => (
                  <div key={af.firearmId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">{getFirearmName(af.firearmId)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFirearmFromSession(af.firearmId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Targets Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Targets</CardTitle>
              <CardDescription>
                {activeSession.targets.length} targets captured
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/capture')}>
              <Target className="h-4 w-4 mr-1" />
              Capture Target
            </Button>
          </CardHeader>
          <CardContent>
            {activeSession.targets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No targets captured yet</p>
                <Button variant="link" onClick={() => navigate('/capture')}>
                  Start capturing
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {activeSession.targets.map((target) => (
                  <div key={target.tempId} className="flex items-start justify-between p-3 border rounded-lg bg-card">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        Target {target.tempId.substring(0, 4)}
                        <Badge variant="secondary" className="text-xs">
                          {target.metrics.groupSizeMoa.toFixed(2)} MOA
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {target.metrics.shotCount} shots • {target.distanceYards} yds
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTarget(target.tempId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={isDiscardDialogOpen}
        onOpenChange={setIsDiscardDialogOpen}
        title="Discard Session"
        description="Are you sure you want to discard this session? All data including captured targets will be lost."
        confirmLabel="Discard"
        variant="destructive"
        onConfirm={handleDiscard}
      />
    </div>
  );
}
