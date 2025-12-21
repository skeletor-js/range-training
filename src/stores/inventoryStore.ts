// Re-export from split stores for backwards compatibility
export { useFirearmStore, useFirearms } from './firearmStore';
export { useAmmoStore, useAmmo } from './ammoStore';
export { useCompatibilityStore, useCompatibility } from './compatibilityStore';

// Combined store for components that need all three domains
import { useFirearmStore } from './firearmStore';
import { useAmmoStore } from './ammoStore';
import { useCompatibilityStore } from './compatibilityStore';

export function useInventoryStore() {
  const firearmStore = useFirearmStore();
  const ammoStore = useAmmoStore();
  const compatibilityStore = useCompatibilityStore();

  return {
    // Firearms
    firearms: firearmStore.firearms,
    loadFirearms: firearmStore.loadFirearms,
    addFirearm: firearmStore.addFirearm,
    updateFirearm: firearmStore.updateFirearm,
    deleteFirearm: firearmStore.deleteFirearm,
    incrementFirearmRoundCount: firearmStore.incrementFirearmRoundCount,

    // Ammo
    ammo: ammoStore.ammo,
    ammoPurchases: ammoStore.ammoPurchases,
    loadAmmo: ammoStore.loadAmmo,
    addAmmo: ammoStore.addAmmo,
    updateAmmo: ammoStore.updateAmmo,
    deleteAmmo: ammoStore.deleteAmmo,
    loadAmmoPurchases: ammoStore.loadAmmoPurchases,
    addAmmoPurchase: ammoStore.addAmmoPurchase,
    updateAmmoPurchase: ammoStore.updateAmmoPurchase,
    deleteAmmoPurchase: ammoStore.deleteAmmoPurchase,
    deductAmmo: ammoStore.deductAmmo,

    // Compatibility
    compatibilities: compatibilityStore.compatibilities,
    loadCompatibilities: compatibilityStore.loadCompatibilities,
    addCompatibility: compatibilityStore.addCompatibility,
    updateCompatibility: compatibilityStore.updateCompatibility,
    deleteCompatibility: compatibilityStore.deleteCompatibility,
    getCompatibilityCountForAmmo: compatibilityStore.getCompatibilityCountForAmmo,
    getCompatibilityCountForFirearm: compatibilityStore.getCompatibilityCountForFirearm,

    // Combined state
    isLoading: firearmStore.isLoading || ammoStore.isLoading || compatibilityStore.isLoading,
    error: firearmStore.error || ammoStore.error || compatibilityStore.error,
    clearError: () => {
      firearmStore.clearError();
      ammoStore.clearError();
      compatibilityStore.clearError();
    },
  };
}
