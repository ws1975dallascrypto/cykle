export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  DRIVER = 'DRIVER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum VehicleType {
  MOTORCYCLE = 'MOTORCYCLE',
  CAR = 'CAR',
  VAN = 'VAN',
  BICYCLE = 'BICYCLE',
}

export interface GarmentPreferences {
  detergentType: 'STANDARD' | 'SENSITIVE' | 'FRAGRANCE_FREE';
  waterTemperature: 'COLD' | 'WARM' | 'HOT';
  dryingMethod: 'TUMBLE_DRY' | 'AIR_DRY' | 'HANG_DRY';
  foldingPreference: 'FOLDED' | 'HANGERS' | 'NO_PREFERENCE';
  starchLevel: 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
  specialInstructions?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  building?: string;
  floor?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
}

export interface PublicUserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}
