import { useState } from 'react';
import { DrillCard } from './DrillCard';
import { Badge } from '@/components/ui/badge';
import { DRILL_CATEGORIES, DRILL_CATEGORY_LABELS, DRILL_PLATFORMS, DRILL_PLATFORM_LABELS } from '@/lib/constants';
import type { DrillWithStats } from '@/types';
import type { DrillCategory, DrillPlatform } from '@/lib/constants';

interface DrillListProps {
  drills: DrillWithStats[];
  onEdit?: (drill: DrillWithStats) => void;
  onDelete?: (drill: DrillWithStats) => void;
}

export function DrillList({ drills, onEdit, onDelete }: DrillListProps) {
  const [selectedCategory, setSelectedCategory] = useState<DrillCategory | 'all'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<DrillPlatform | 'all'>('all');

  // Filter drills by category and platform
  const filteredDrills = drills.filter((d) => {
    const matchesCategory = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesPlatform =
      selectedPlatform === 'all' ||
      d.platform === selectedPlatform ||
      d.platform === 'both';
    return matchesCategory && matchesPlatform;
  });

  // Group by category
  const groupedDrills = DRILL_CATEGORIES.reduce(
    (acc, category) => {
      const categoryDrills = filteredDrills.filter((d) => d.category === category);
      if (categoryDrills.length > 0) {
        acc[category] = categoryDrills;
      }
      return acc;
    },
    {} as Record<DrillCategory, DrillWithStats[]>
  );

  return (
    <div className="space-y-6">
      {/* Platform filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedPlatform === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedPlatform('all')}
        >
          All Platforms
        </Badge>
        {DRILL_PLATFORMS.filter((p) => p !== 'both').map((platform) => {
          const count = drills.filter(
            (d) => d.platform === platform || d.platform === 'both'
          ).length;
          if (count === 0) return null;
          return (
            <Badge
              key={platform}
              variant={selectedPlatform === platform ? 'default' : 'outline'}
              className={`cursor-pointer ${
                platform === 'carbine'
                  ? selectedPlatform === platform
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : ''
                  : selectedPlatform === platform
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : ''
              }`}
              onClick={() => setSelectedPlatform(platform)}
            >
              {DRILL_PLATFORM_LABELS[platform]} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </Badge>
        {DRILL_CATEGORIES.map((category) => {
          const count = drills.filter((d) => d.category === category).length;
          if (count === 0) return null;
          return (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {DRILL_CATEGORY_LABELS[category]} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Grouped drills */}
      {selectedCategory === 'all' ? (
        // Show grouped by category
        Object.entries(groupedDrills).map(([category, categoryDrills]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {DRILL_CATEGORY_LABELS[category as DrillCategory]}
            </h3>
            <div className="space-y-3">
              {categoryDrills.map((drill) => (
                <DrillCard
                  key={drill.id}
                  drill={drill}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        // Show flat list for filtered category
        <div className="space-y-3">
          {filteredDrills.map((drill) => (
            <DrillCard
              key={drill.id}
              drill={drill}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {filteredDrills.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No drills found
        </div>
      )}
    </div>
  );
}
