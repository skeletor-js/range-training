// Re-export from split stores for backwards compatibility
export { useFirearmStore, useFirearms } from './firearmStore';
export { useAmmoStore, useAmmo } from './ammoStore';
export { useCompatibilityStore, useCompatibility } from './compatibilityStore';

// Combined store for components that need all three domains
import { useCallback, useMemo } from 'react';
import { useFirearmStore } from './firearmStore';
import { useAmmoStore } from './ammoStore';
import { useCompatibilityStore } from './compatibilityStore';

export function useInventoryStore() {
  const firearmStore = useFirearmStore();
  const ammoStore = useAmmoStore();
  const compatibilityStore = useCompatibilityStore();

  // Memoize clearError to prevent infinite loops in useEffect dependencies
  const clearError = useCallback(() => {
    firearmStore.clearError();
    ammoStore.clearError();
    compatibilityStore.clearError();
  }, [firearmStore.clearError, ammoStore.clearError, compatibilityStore.clearError]);

  return useMemo(() => ({
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
    clearError,
  }), [
    firearmStore.firearms,
    firearmStore.loadFirearms,
    firearmStore.addFirearm,
    firearmStore.updateFirearm,
    firearmStore.deleteFirearm,
    firearmStore.incrementFirearmRoundCount,
    firearmStore.isLoading,
    firearmStore.error,
    ammoStore.ammo,
    ammoStore.ammoPurchases,
    ammoStore.loadAmmo,
    ammoStore.addAmmo,
    ammoStore.updateAmmo,
    ammoStore.deleteAmmo,
    ammoStore.loadAmmoPurchases,
    ammoStore.addAmmoPurchase,
    ammoStore.updateAmmoPurchase,
    ammoStore.deleteAmmoPurchase,
    ammoStore.deductAmmo,
    ammoStore.isLoading,
    ammoStore.error,
    compatibilityStore.compatibilities,
    compatibilityStore.loadCompatibilities,
    compatibilityStore.addCompatibility,
    compatibilityStore.updateCompatibility,
    compatibilityStore.deleteCompatibility,
    compatibilityStore.getCompatibilityCountForAmmo,
    compatibilityStore.getCompatibilityCountForFirearm,
    compatibilityStore.isLoading,
    compatibilityStore.error,
    clearError,
  ]);
}
