import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Plus, Trash2, MoreVertical } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import type { Ammo, AmmoPurchase } from '@/types';
import {
  calculatePPRMetrics,
  formatPPR,
  formatCurrency,
  getPPRTrend,
  getPPRTrendColor,
} from '@/lib/pprMetrics';
import { useAmmo } from '@/stores/inventoryStore';

interface PurchaseHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ammo: Ammo | null;
  onAddPurchase: () => void;
}

export function PurchaseHistorySheet({
  open,
  onOpenChange,
  ammo,
  onAddPurchase,
}: PurchaseHistorySheetProps) {
  const { loadAmmoPurchases, ammoPurchases, deleteAmmoPurchase } = useAmmo();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<AmmoPurchase | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load purchases when sheet opens
  useEffect(() => {
    if (open && ammo) {
      setIsLoading(true);
      loadAmmoPurchases(ammo.id).finally(() => setIsLoading(false));
    }
  }, [open, ammo, loadAmmoPurchases]);

  const metrics = calculatePPRMetrics(ammoPurchases);
  const trend = metrics ? getPPRTrend(metrics.currentPPR, metrics.averagePPR) : 'stable';

  const handleDelete = async () => {
    if (!deleteConfirm || !ammo) return;
    setIsDeleting(true);
    try {
      await deleteAmmoPurchase(deleteConfirm.id, ammo.id, deleteConfirm.quantity);
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  if (!ammo) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] flex flex-col">
          <SheetHeader className="text-left">
            <SheetTitle>Purchase History</SheetTitle>
            <SheetDescription>
              {ammo.brand} {ammo.productLine} - {ammo.caliber} {ammo.grainWeight}gr
            </SheetDescription>
          </SheetHeader>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : ammoPurchases.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <p className="text-muted-foreground">No purchases recorded</p>
              <Button onClick={onAddPurchase}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Purchase
              </Button>
            </div>
          ) : (
            <>
              {/* PPR Metrics Summary */}
              {metrics && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Current</p>
                        <p className="text-lg font-semibold flex items-center justify-center gap-1">
                          {formatPPR(metrics.currentPPR)}
                          <TrendIcon className={`h-4 w-4 ${getPPRTrendColor(trend)}`} />
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Average</p>
                        <p className="text-lg font-semibold">{formatPPR(metrics.averagePPR)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Best</p>
                        <p className="text-lg font-semibold text-green-500">
                          {formatPPR(metrics.lowestPPR)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground px-1">
                    <span>{metrics.totalPurchased.toLocaleString()} rounds purchased</span>
                    <span>{formatCurrency(metrics.totalSpent)} spent</span>
                  </div>

                  {metrics.bestSeller && (
                    <p className="text-xs text-muted-foreground text-center">
                      Best deal from: <span className="text-foreground">{metrics.bestSeller}</span>
                    </p>
                  )}
                </div>
              )}

              <Separator />

              {/* Purchase List Header */}
              <div className="flex items-center justify-between py-2">
                <h3 className="text-sm font-medium">Purchases</h3>
                <Button size="sm" variant="outline" onClick={onAddPurchase}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {/* Purchase List */}
              <div className="flex-1 overflow-y-auto space-y-2 -mx-6 px-6">
                {ammoPurchases
                  .slice()
                  .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
                  .map((purchase) => {
                    const ppr = purchase.priceTotal / purchase.quantity;
                    return (
                      <Card key={purchase.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {purchase.quantity.toLocaleString()} rds
                                </span>
                                <span className="text-muted-foreground">
                                  {formatCurrency(purchase.priceTotal)} ({formatPPR(ppr)}/rd)
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                  {new Date(purchase.purchaseDate).toLocaleDateString()}
                                </span>
                                {purchase.seller && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{purchase.seller}</span>
                                  </>
                                )}
                              </div>
                              {purchase.notes && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                  {purchase.notes}
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
                                <DropdownMenuItem
                                  onClick={() => setDeleteConfirm(purchase)}
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
                    );
                  })}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete Purchase"
        description={`This will remove the purchase of ${deleteConfirm?.quantity.toLocaleString()} rounds and deduct from your inventory. This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}
