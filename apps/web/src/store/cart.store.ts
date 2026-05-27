import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, GarmentPreferences, PricingType } from '@cykle/shared';

export interface ScheduleSlot {
  date: string; // ISO date string
  time: string; // 'HH:MM'
}

interface CartState {
  vendorProfileId: string | null;
  vendorName: string | null;
  items: CartItem[];
  estimatedWeightKg: number;
  garmentPreferences: GarmentPreferences;
  pickupSlot: ScheduleSlot | null;
  deliverySlot: ScheduleSlot | null;
  pickupAddressId: string | null;
  deliveryAddressId: string | null;
  paymentMethod: 'gcash' | 'maya' | 'card' | 'cod';
  specialInstructions: string;

  // Computed
  subtotal: () => number;
  itemCount: () => number;

  // Actions
  setVendor: (id: string, name: string) => void;
  addItem: (item: CartItem) => void;
  removeItem: (serviceId: string, serviceItemId?: string) => void;
  updateQuantity: (serviceId: string, quantity: number, serviceItemId?: string) => void;
  setWeightEstimate: (kg: number) => void;
  setGarmentPreferences: (prefs: Partial<GarmentPreferences>) => void;
  setPickupSlot: (slot: ScheduleSlot) => void;
  setDeliverySlot: (slot: ScheduleSlot) => void;
  setPickupAddressId: (id: string) => void;
  setDeliveryAddressId: (id: string) => void;
  setPaymentMethod: (method: CartState['paymentMethod']) => void;
  setSpecialInstructions: (text: string) => void;
  clearCart: () => void;
}

const defaultPrefs: GarmentPreferences = {
  detergentType: 'STANDARD',
  waterTemperature: 'COLD',
  dryingMethod: 'TUMBLE_DRY',
  foldingPreference: 'FOLDED',
  starchLevel: 'NONE',
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      vendorProfileId: null,
      vendorName: null,
      items: [],
      estimatedWeightKg: 3,
      garmentPreferences: defaultPrefs,
      pickupSlot: null,
      deliverySlot: null,
      pickupAddressId: null,
      deliveryAddressId: null,
      paymentMethod: 'gcash',
      specialInstructions: '',

      subtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      setVendor: (id, name) => {
        const current = get().vendorProfileId;
        if (current && current !== id) {
          // Switching vendors — clear cart
          set({ vendorProfileId: id, vendorName: name, items: [] });
        } else {
          set({ vendorProfileId: id, vendorName: name });
        }
      },

      addItem: (item) => {
        const items = get().items;
        const key = item.serviceItemId ?? item.serviceId;
        const existing = items.find(
          (i) => (i.serviceItemId ?? i.serviceId) === key
        );
        if (existing) {
          set({
            items: items.map((i) =>
              (i.serviceItemId ?? i.serviceId) === key
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }

        // Auto-update weight estimate for PER_KG items
        if (item.pricingType === PricingType.PER_KG) {
          const current = get().estimatedWeightKg;
          set({ estimatedWeightKg: Math.max(current, item.quantity) });
        }
      },

      removeItem: (serviceId, serviceItemId) => {
        set({
          items: get().items.filter(
            (i) => !((i.serviceId === serviceId) && (i.serviceItemId === serviceItemId))
          ),
        });
      },

      updateQuantity: (serviceId, quantity, serviceItemId) => {
        if (quantity <= 0) {
          get().removeItem(serviceId, serviceItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.serviceId === serviceId && i.serviceItemId === serviceItemId
              ? { ...i, quantity }
              : i
          ),
        });
      },

      setWeightEstimate: (kg) => set({ estimatedWeightKg: Math.max(1, kg) }),

      setGarmentPreferences: (prefs) =>
        set({ garmentPreferences: { ...get().garmentPreferences, ...prefs } }),

      setPickupSlot: (slot) => set({ pickupSlot: slot }),
      setDeliverySlot: (slot) => set({ deliverySlot: slot }),
      setPickupAddressId: (id) => set({ pickupAddressId: id }),
      setDeliveryAddressId: (id) => set({ deliveryAddressId: id }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setSpecialInstructions: (text) => set({ specialInstructions: text }),

      clearCart: () =>
        set({
          vendorProfileId: null,
          vendorName: null,
          items: [],
          estimatedWeightKg: 3,
          garmentPreferences: defaultPrefs,
          pickupSlot: null,
          deliverySlot: null,
          pickupAddressId: null,
          deliveryAddressId: null,
          specialInstructions: '',
        }),
    }),
    { name: 'cykle-cart' }
  )
);
