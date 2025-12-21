import { useState, useEffect } from 'react';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RatingBadge } from './RatingBadge';
import { useCompatibility } from '@/stores/inventoryStore';
import type { Firearm, Ammo, FirearmAmmoCompatibility } from '@/types';

interface CompatibilityListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Either pass firearm (to see compatible ammo) or ammo (to see compatible firearms)
  firearm?: Firearm;
  ammo?: Ammo;
  onAdd: () => void;
  onEdit: (compatibility: FirearmAmmoCompatibility) => void;
}

export function CompatibilityList({
  open,
  onOpenChange,
  firearm,
  ammo,
  onAdd,
  onEdit,
}: CompatibilityListProps) {
  const {
    compatibilities,
    firearms,
    ammo: ammoList,
    loadCompatibilities,
    loadFirearms,
    loadAmmo,
    deleteCompatibility,
  } = useCompatibility();

  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<FirearmAmmoCompatibility | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Determine viewing mode
  const viewMode = firearm ? 'ammo' : 'firearms';
  const title = firearm
    ? `Compatible Ammo for ${firearm.name}`
    : `Compatible Weapons for ${ammo?.brand} ${ammo?.productLine || ''} ${ammo?.caliber}`;

  // Load data when sheet opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      Promise.all([
        loadFirearms(),
        loadAmmo(),
        loadCompatibilities(firearm?.id, ammo?.id),
      ]).finally(() => setIsLoading(false));
    }
  }, [open, firearm?.id, ammo?.id, loadFirearms, loadAmmo, loadCompatibilities]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      await deleteCompatibility(deleteConfirm.id);
      // Reload compatibilities
      await loadCompatibilities(firearm?.id, ammo?.id);
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to get linked item details
  const getLinkedItem = (compatibility: FirearmAmmoCompatibility) => {
    if (viewMode === 'ammo') {
      const linkedAmmo = ammoList.find((a) => a.id === compatibility.ammoId);
      return linkedAmmo
        ? `${linkedAmmo.brand} ${linkedAmmo.productLine || ''} ${linkedAmmo.caliber} ${linkedAmmo.grainWeight}gr`
        : 'Unknown Ammo';
    } else {
      const linkedFirearm = firearms.find((f) => f.id === compatibility.firearmId);
      return linkedFirearm ? `${linkedFirearm.name} (${linkedFirearm.caliber})` : 'Unknown Weapon';
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle>
              {viewMode === 'ammo' ? 'Compatible Ammo' : 'Compatible Weapons'}
            </SheetTitle>
            <SheetDescription>{title}</SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : compatibilities.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">No compatibility data yet</p>
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add {viewMode === 'ammo' ? 'Compatible Ammo' : 'Compatible Weapon'}
              </Button>
            </div>
          ) : (
            <>
              {/* Header with Add button */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  {compatibilities.length} linked item{compatibilities.length !== 1 ? 's' : ''}
                </span>
                <Button size="sm" variant="outline" onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Compatibility List */}
              <div className="flex-1 overflow-y-auto space-y-2 -mx-6 px-6">
                {compatibilities.map((compat) => (
                  <Card key={compat.id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {getLinkedItem(compat)}
                          </h4>

                          {compat.performanceRating && (
                            <div className="mt-1">
                              <RatingBadge
                                rating={compat.performanceRating as 'excellent' | 'good' | 'fair' | 'poor'}
                                label="Perf"
                              />
                            </div>
                          )}

                          {compat.loadNotes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {compat.loadNotes}
                            </p>
                          )}

                          {compat.lastTestedDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Last tested:{' '}
                              {new Date(compat.lastTestedDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(compat)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirm(compat)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Compatibility"
        description="This will remove the compatibility link between this weapon and ammo. This action cannot be undone."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
