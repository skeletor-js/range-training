import { MoreVertical, Pencil, Trash2, Plus, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Ammo } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AmmoCardProps {
  ammo: Ammo;
  onEdit: (ammo: Ammo) => void;
  onDelete: (ammo: Ammo) => void;
  onAddPurchase: (ammo: Ammo) => void;
  onViewHistory: (ammo: Ammo) => void;
}

export function AmmoCard({
  ammo,
  onEdit,
  onDelete,
  onAddPurchase,
  onViewHistory,
}: AmmoCardProps) {
  const roundCount = ammo.roundCount ?? 0;
  const isLow = roundCount < 50;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">
                {ammo.brand}
                {ammo.productLine && ` ${ammo.productLine}`}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {ammo.caliber} - {ammo.grainWeight}gr
              {ammo.bulletType && ` ${ammo.bulletType}`}
            </p>

            <div className="flex items-center gap-2">
              <Badge variant={isLow ? 'destructive' : 'secondary'}>
                {roundCount.toLocaleString()} rounds
              </Badge>
              {ammo.rating && (
                <span className="text-xs text-muted-foreground">
                  {'★'.repeat(ammo.rating)}
                  {'☆'.repeat(5 - ammo.rating)}
                </span>
              )}
            </div>

            {(ammo.reliability || ammo.accuracy) && (
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {ammo.reliability && (
                  <span>Reliability: {ammo.reliability}</span>
                )}
                {ammo.accuracy && <span>Accuracy: {ammo.accuracy}</span>}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddPurchase(ammo)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Purchase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewHistory(ammo)}>
                <History className="h-4 w-4 mr-2" />
                Purchase History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(ammo)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(ammo)}
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
}
