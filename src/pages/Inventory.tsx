import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FirearmList } from '@/components/inventory/FirearmList';
import { FirearmForm } from '@/components/inventory/FirearmForm';
import { AmmoList } from '@/components/inventory/AmmoList';
import { AmmoForm } from '@/components/inventory/AmmoForm';
import { AmmoPurchaseForm } from '@/components/inventory/AmmoPurchaseForm';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { Firearm, Ammo, AmmoPurchase } from '@/types';
import type { FirearmFormData, AmmoFormData, AmmoPurchaseFormData } from '@/lib/validations';
import { formatDate } from '@/lib/utils';

export function Inventory() {
  const {
    firearms,
    ammo,
    ammoPurchases,
    isLoading,
    error,
    loadFirearms,
    loadAmmo,
    loadAmmoPurchases,
    addFirearm,
    updateFirearm,
    deleteFirearm,
    addAmmo,
    updateAmmo,
    deleteAmmo,
    addAmmoPurchase,
    clearError,
  } = useInventoryStore();

  const [activeTab, setActiveTab] = useState('firearms');

  // Firearm state
  const [showFirearmForm, setShowFirearmForm] = useState(false);
  const [editingFirearm, setEditingFirearm] = useState<Firearm | null>(null);
  const [deletingFirearm, setDeletingFirearm] = useState<Firearm | null>(null);

  // Ammo state
  const [showAmmoForm, setShowAmmoForm] = useState(false);
  const [editingAmmo, setEditingAmmo] = useState<Ammo | null>(null);
  const [deletingAmmo, setDeletingAmmo] = useState<Ammo | null>(null);
  const [purchasingAmmo, setPurchasingAmmo] = useState<Ammo | null>(null);
  const [viewingHistoryAmmo, setViewingHistoryAmmo] = useState<Ammo | null>(
    null
  );

  // Load data on mount
  useEffect(() => {
    loadFirearms();
    loadAmmo();
  }, [loadFirearms, loadAmmo]);

  // Clear error when switching tabs
  useEffect(() => {
    clearError();
  }, [activeTab, clearError]);

  // Firearm handlers
  const handleAddFirearm = () => {
    setEditingFirearm(null);
    setShowFirearmForm(true);
  };

  const handleEditFirearm = (firearm: Firearm) => {
    setEditingFirearm(firearm);
    setShowFirearmForm(true);
  };

  const handleSaveFirearm = async (data: FirearmFormData) => {
    if (editingFirearm) {
      await updateFirearm(editingFirearm.id, data);
    } else {
      await addFirearm(data);
    }
  };

  const handleConfirmDeleteFirearm = async () => {
    if (deletingFirearm) {
      await deleteFirearm(deletingFirearm.id);
      setDeletingFirearm(null);
    }
  };

  // Ammo handlers
  const handleAddAmmo = () => {
    setEditingAmmo(null);
    setShowAmmoForm(true);
  };

  const handleEditAmmo = (ammoItem: Ammo) => {
    setEditingAmmo(ammoItem);
    setShowAmmoForm(true);
  };

  const handleSaveAmmo = async (data: AmmoFormData) => {
    if (editingAmmo) {
      await updateAmmo(editingAmmo.id, data);
    } else {
      await addAmmo(data);
    }
  };

  const handleConfirmDeleteAmmo = async () => {
    if (deletingAmmo) {
      await deleteAmmo(deletingAmmo.id);
      setDeletingAmmo(null);
    }
  };

  const handleSaveAmmoPurchase = async (
    ammoId: string,
    data: AmmoPurchaseFormData
  ) => {
    await addAmmoPurchase(ammoId, data);
  };

  const handleViewHistory = async (ammoItem: Ammo) => {
    await loadAmmoPurchases(ammoItem.id);
    setViewingHistoryAmmo(ammoItem);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <PageHeader
        title="Inventory"
        description="Manage your firearms and ammunition"
      />

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="firearms">Firearms</TabsTrigger>
            <TabsTrigger value="ammo">Ammo</TabsTrigger>
          </TabsList>

          <Button
            size="sm"
            onClick={activeTab === 'firearms' ? handleAddFirearm : handleAddAmmo}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add {activeTab === 'firearms' ? 'Firearm' : 'Ammo'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <TabsContent value="firearms" className="mt-0">
              <FirearmList
                firearms={firearms}
                onEdit={handleEditFirearm}
                onDelete={setDeletingFirearm}
                onAdd={handleAddFirearm}
              />
            </TabsContent>

            <TabsContent value="ammo" className="mt-0">
              <AmmoList
                ammo={ammo}
                onEdit={handleEditAmmo}
                onDelete={setDeletingAmmo}
                onAddPurchase={setPurchasingAmmo}
                onViewHistory={handleViewHistory}
                onAdd={handleAddAmmo}
              />
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Firearm Form Sheet */}
      <FirearmForm
        open={showFirearmForm}
        onOpenChange={setShowFirearmForm}
        firearm={editingFirearm}
        onSave={handleSaveFirearm}
      />

      {/* Firearm Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingFirearm}
        onOpenChange={(open) => !open && setDeletingFirearm(null)}
        title="Delete Firearm"
        description={`Are you sure you want to delete "${deletingFirearm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDeleteFirearm}
      />

      {/* Ammo Form Sheet */}
      <AmmoForm
        open={showAmmoForm}
        onOpenChange={setShowAmmoForm}
        ammo={editingAmmo}
        onSave={handleSaveAmmo}
      />

      {/* Ammo Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingAmmo}
        onOpenChange={(open) => !open && setDeletingAmmo(null)}
        title="Delete Ammo"
        description={`Are you sure you want to delete "${deletingAmmo?.brand} ${deletingAmmo?.productLine ?? ''}"? This will also delete all purchase history.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDeleteAmmo}
      />

      {/* Ammo Purchase Form */}
      <AmmoPurchaseForm
        open={!!purchasingAmmo}
        onOpenChange={(open) => !open && setPurchasingAmmo(null)}
        ammo={purchasingAmmo}
        onSave={handleSaveAmmoPurchase}
      />

      {/* Purchase History Dialog */}
      <Dialog
        open={!!viewingHistoryAmmo}
        onOpenChange={(open) => !open && setViewingHistoryAmmo(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase History</DialogTitle>
            {viewingHistoryAmmo && (
              <p className="text-sm text-muted-foreground">
                {viewingHistoryAmmo.brand} {viewingHistoryAmmo.productLine} -{' '}
                {viewingHistoryAmmo.caliber}
              </p>
            )}
          </DialogHeader>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {ammoPurchases.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No purchase history yet.
              </p>
            ) : (
              ammoPurchases.map((purchase: AmmoPurchase) => (
                <div
                  key={purchase.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {purchase.quantity.toLocaleString()} rounds
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${purchase.priceTotal.toFixed(2)} ($
                        {(purchase.priceTotal / purchase.quantity).toFixed(3)}
                        /rd)
                      </p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{formatDate(purchase.purchaseDate)}</p>
                      {purchase.seller && <p>{purchase.seller}</p>}
                    </div>
                  </div>
                  {purchase.notes && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {purchase.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
