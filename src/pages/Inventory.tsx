import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FirearmList } from '@/components/inventory/FirearmList';
import { FirearmForm } from '@/components/inventory/FirearmForm';
import { AmmoList } from '@/components/inventory/AmmoList';
import { AmmoForm } from '@/components/inventory/AmmoForm';
import { AmmoPurchaseForm } from '@/components/inventory/AmmoPurchaseForm';
import { PurchaseHistorySheet } from '@/components/inventory/PurchaseHistorySheet';
import { CompatibilityForm } from '@/components/inventory/CompatibilityForm';
import { CompatibilityList } from '@/components/inventory/CompatibilityList';
import { useInventoryStore } from '@/stores/inventoryStore';
import type { Firearm, Ammo, FirearmAmmoCompatibility } from '@/types';
import type { FirearmFormData, AmmoFormData, AmmoPurchaseFormData } from '@/lib/validations';

export function Inventory() {
  const {
    firearms,
    ammo,
    isLoading,
    error,
    loadFirearms,
    loadAmmo,
    addFirearm,
    updateFirearm,
    deleteFirearm,
    addAmmo,
    updateAmmo,
    deleteAmmo,
    addAmmoPurchase,
    loadCompatibilities,
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
  const [viewingHistoryAmmo, setViewingHistoryAmmo] = useState<Ammo | null>(null);

  // Compatibility state
  const [compatibilityFirearm, setCompatibilityFirearm] = useState<Firearm | null>(null);
  const [compatibilityAmmo, setCompatibilityAmmo] = useState<Ammo | null>(null);
  const [showCompatibilityForm, setShowCompatibilityForm] = useState(false);
  const [editingCompatibility, setEditingCompatibility] = useState<FirearmAmmoCompatibility | null>(null);

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

  const handleViewHistory = (ammoItem: Ammo) => {
    setViewingHistoryAmmo(ammoItem);
  };

  // Compatibility handlers
  const handleViewFirearmCompatibility = (firearm: Firearm) => {
    setCompatibilityFirearm(firearm);
    setCompatibilityAmmo(null);
  };

  const handleViewAmmoCompatibility = (ammoItem: Ammo) => {
    setCompatibilityAmmo(ammoItem);
    setCompatibilityFirearm(null);
  };

  const handleAddCompatibility = () => {
    setEditingCompatibility(null);
    setShowCompatibilityForm(true);
  };

  const handleEditCompatibility = (compat: FirearmAmmoCompatibility) => {
    setEditingCompatibility(compat);
    setShowCompatibilityForm(true);
  };

  const handleCompatibilitySaved = async () => {
    // Reload compatibilities after save
    if (compatibilityFirearm) {
      await loadCompatibilities(compatibilityFirearm.id);
    } else if (compatibilityAmmo) {
      await loadCompatibilities(undefined, compatibilityAmmo.id);
    }
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
                onViewCompatibility={handleViewFirearmCompatibility}
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
                onViewCompatibility={handleViewAmmoCompatibility}
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

      {/* Purchase History Sheet */}
      <PurchaseHistorySheet
        open={!!viewingHistoryAmmo}
        onOpenChange={(open) => !open && setViewingHistoryAmmo(null)}
        ammo={viewingHistoryAmmo}
        onAddPurchase={() => {
          setViewingHistoryAmmo(null);
          if (viewingHistoryAmmo) {
            setPurchasingAmmo(viewingHistoryAmmo);
          }
        }}
      />

      {/* Compatibility List for Firearms */}
      <CompatibilityList
        open={!!compatibilityFirearm}
        onOpenChange={(open) => !open && setCompatibilityFirearm(null)}
        firearm={compatibilityFirearm ?? undefined}
        onAdd={handleAddCompatibility}
        onEdit={handleEditCompatibility}
      />

      {/* Compatibility List for Ammo */}
      <CompatibilityList
        open={!!compatibilityAmmo}
        onOpenChange={(open) => !open && setCompatibilityAmmo(null)}
        ammo={compatibilityAmmo ?? undefined}
        onAdd={handleAddCompatibility}
        onEdit={handleEditCompatibility}
      />

      {/* Compatibility Form */}
      <CompatibilityForm
        open={showCompatibilityForm}
        onOpenChange={setShowCompatibilityForm}
        firearm={compatibilityFirearm ?? undefined}
        ammo={compatibilityAmmo ?? undefined}
        existing={editingCompatibility ?? undefined}
        onSave={handleCompatibilitySaved}
      />
    </div>
  );
}
