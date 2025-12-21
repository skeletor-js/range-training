import { MoreVertical, Pencil, Trash2, Link2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Firearm } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FirearmCardProps {
  firearm: Firearm;
  compatibilityCount?: number;
  onEdit: (firearm: Firearm) => void;
  onDelete: (firearm: Firearm) => void;
  onViewCompatibility?: (firearm: Firearm) => void;
}

export function FirearmCard({
  firearm,
  compatibilityCount,
  onEdit,
  onDelete,
  onViewCompatibility,
}: FirearmCardProps) {
  const typeLabel = firearm.type
    ? firearm.type.charAt(0).toUpperCase() + firearm.type.slice(1)
    : 'Other';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{firearm.name}</h3>
              <Badge variant="secondary" className="shrink-0">
                {typeLabel}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {firearm.caliber}
              {firearm.manufacturer && ` - ${firearm.manufacturer}`}
              {firearm.model && ` ${firearm.model}`}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{(firearm.roundCount ?? 0).toLocaleString()} rounds fired</span>
              {firearm.serialNumber && (
                <span className="font-mono">S/N: {firearm.serialNumber}</span>
              )}
            </div>

            {/* Compatibility count */}
            {compatibilityCount !== undefined && compatibilityCount > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Link2 className="h-3 w-3" />
                <span>{compatibilityCount} compatible ammo type{compatibilityCount !== 1 ? 's' : ''}</span>
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
              {onViewCompatibility && (
                <>
                  <DropdownMenuItem onClick={() => onViewCompatibility(firearm)}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Compatible Ammo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={() => onEdit(firearm)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(firearm)}
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
