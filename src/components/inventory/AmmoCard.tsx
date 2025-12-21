import { MoreVertical, Pencil, Trash2, Plus, History, Link2 } from 'lucide-react';
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
import { StarRating } from './StarRating';
import { RatingBadge } from './RatingBadge';

interface AmmoCardProps {
  ammo: Ammo;
  averagePPR?: number;
  compatibilityCount?: number;
  onEdit: (ammo: Ammo) => void;
  onDelete: (ammo: Ammo) => void;
  onAddPurchase: (ammo: Ammo) => void;
  onViewHistory: (ammo: Ammo) => void;
  onViewCompatibility?: (ammo: Ammo) => void;
}

export function AmmoCard({
  ammo,
  averagePPR,
  compatibilityCount,
  onEdit,
  onDelete,
  onAddPurchase,
  onViewHistory,
  onViewCompatibility,
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

            {/* Rating with visual stars */}
            {ammo.rating && (
              <div className="mb-2">
                <StarRating rating={ammo.rating} size="sm" />
              </div>
            )}

            {/* Reliability and Accuracy badges */}
            {(ammo.reliability || ammo.accuracy) && (
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {ammo.reliability && (
                  <RatingBadge rating={ammo.reliability} label="Rel" />
                )}
                {ammo.accuracy && (
                  <RatingBadge rating={ammo.accuracy} label="Acc" />
                )}
              </div>
            )}

            {/* Round count and PPR */}
            <div className="flex items-center gap-2">
              <Badge variant={isLow ? 'destructive' : 'secondary'}>
                {roundCount.toLocaleString()} rounds
              </Badge>
              {averagePPR !== undefined && averagePPR > 0 && (
                <span className="text-xs text-muted-foreground">
                  ${averagePPR.toFixed(3)}/rd avg
                </span>
              )}
            </div>

            {/* Compatibility count */}
            {compatibilityCount !== undefined && compatibilityCount > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" />
                <span>{compatibilityCount} compatible weapon{compatibilityCount !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Review notes preview */}
            {ammo.reviewNotes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {ammo.reviewNotes}
              </p>
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
              {onViewCompatibility && (
                <DropdownMenuItem onClick={() => onViewCompatibility(ammo)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Compatible Weapons
                </DropdownMenuItem>
              )}
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
