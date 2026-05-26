import { PrismaClient, UserRole, VehicleType, ServiceType, PricingType } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding database...');

  // ── Super Admin ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cykle.app' },
    update: {},
    create: {
      email: 'admin@cykle.app',
      phone: '+971500000001',
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      isVerified: true,
    },
  });
  console.log(`✅  Admin: ${admin.email}`);

  // ── Vendor ─────────────────────────────────────────────────────────────────
  const vendorPassword = await bcrypt.hash('Vendor@1234!', 12);
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@freshpress.ae' },
    update: {},
    create: {
      email: 'vendor@freshpress.ae',
      phone: '+971500000002',
      passwordHash: vendorPassword,
      role: UserRole.VENDOR,
      firstName: 'Ahmad',
      lastName: 'Al-Rashidi',
      isVerified: true,
      vendorProfile: {
        create: {
          shopName: 'FreshPress Laundry',
          description: 'Premium laundry and dry cleaning in Downtown Dubai',
          street: '12 Sheikh Mohammed Bin Rashid Blvd',
          city: 'Dubai',
          state: 'Dubai',
          country: 'UAE',
          postalCode: '00000',
          latitude: 25.1972,
          longitude: 55.2744,
          isOpen: true,
          isVerified: true,
          rating: 4.8,
          totalReviews: 312,
          operatingHours: {
            monday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            tuesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            wednesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            thursday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
            friday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
            saturday: { isOpen: true, openTime: '09:00', closeTime: '23:00' },
            sunday: { isOpen: true, openTime: '10:00', closeTime: '20:00' },
          },
        },
      },
    },
    include: { vendorProfile: true },
  });
  console.log(`✅  Vendor: ${vendorUser.email}`);

  // Add services to vendor
  const vendorProfile = vendorUser.vendorProfile!;
  const washFold = await prisma.service.upsert({
    where: { id: 'seed-svc-001' },
    update: {},
    create: {
      id: 'seed-svc-001',
      vendorProfileId: vendorProfile.id,
      name: 'Wash & Fold',
      description: 'Machine washed, tumble dried, and neatly folded',
      serviceType: ServiceType.WASH_AND_FOLD,
      pricingType: PricingType.PER_KG,
      basePrice: 15,
      unit: 'kg',
      minQuantity: 1,
      turnaroundHours: 24,
      isActive: true,
    },
  });

  await prisma.service.upsert({
    where: { id: 'seed-svc-002' },
    update: {},
    create: {
      id: 'seed-svc-002',
      vendorProfileId: vendorProfile.id,
      name: 'Dry Cleaning',
      description: 'Professional dry cleaning for delicate garments',
      serviceType: ServiceType.DRY_CLEAN,
      pricingType: PricingType.PER_ITEM,
      basePrice: 25,
      unit: 'item',
      turnaroundHours: 48,
      isActive: true,
      serviceItems: {
        create: [
          { name: 'Shirt', pricePerItem: 20, displayOrder: 1 },
          { name: 'Trousers', pricePerItem: 22, displayOrder: 2 },
          { name: 'Dress', pricePerItem: 35, displayOrder: 3 },
          { name: 'Suit (2-piece)', pricePerItem: 75, displayOrder: 4 },
          { name: 'Abaya', pricePerItem: 45, displayOrder: 5 },
          { name: 'Winter Coat', pricePerItem: 80, displayOrder: 6 },
        ],
      },
    },
  });

  await prisma.service.upsert({
    where: { id: 'seed-svc-003' },
    update: {},
    create: {
      id: 'seed-svc-003',
      vendorProfileId: vendorProfile.id,
      name: 'Express Wash & Iron',
      description: '4-hour turnaround wash, iron and hang',
      serviceType: ServiceType.EXPRESS,
      pricingType: PricingType.PER_KG,
      basePrice: 30,
      unit: 'kg',
      minQuantity: 1,
      turnaroundHours: 4,
      isActive: true,
      isExpress: true,
    },
  });

  console.log(`✅  Services seeded for ${vendorProfile.shopName}`);

  // ── Customer ───────────────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer@1234!', 12);
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      phone: '+971500000003',
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      firstName: 'Sarah',
      lastName: 'Johnson',
      isVerified: true,
      customerProfile: {
        create: {
          garmentPreferences: {
            detergentType: 'SENSITIVE',
            waterTemperature: 'COLD',
            dryingMethod: 'TUMBLE_DRY',
            foldingPreference: 'FOLDED',
            starchLevel: 'NONE',
          },
          addresses: {
            create: [
              {
                label: 'Home',
                street: '45 Marina Walk',
                city: 'Dubai',
                state: 'Dubai',
                country: 'UAE',
                postalCode: '00000',
                latitude: 25.0772,
                longitude: 55.1404,
                isDefault: true,
              },
            ],
          },
        },
      },
    },
  });
  console.log('✅  Customer seeded');

  // ── Driver ─────────────────────────────────────────────────────────────────
  const driverPassword = await bcrypt.hash('Driver@1234!', 12);
  await prisma.user.upsert({
    where: { email: 'driver@cykle.app' },
    update: {},
    create: {
      email: 'driver@cykle.app',
      phone: '+971500000004',
      passwordHash: driverPassword,
      role: UserRole.DRIVER,
      firstName: 'Khalid',
      lastName: 'Al-Mansoori',
      isVerified: true,
      driverProfile: {
        create: {
          vehicleType: VehicleType.MOTORCYCLE,
          vehiclePlate: 'DXB-A-12345',
          vehicleModel: 'Honda PCX 125',
          licenseNumber: 'DL-2024-12345',
          isOnline: true,
          currentLat: 25.15,
          currentLng: 55.20,
          rating: 4.9,
          totalReviews: 89,
          totalDeliveries: 234,
        },
      },
    },
  });
  console.log('✅  Driver seeded');

  // ── Platform Config ────────────────────────────────────────────────────────
  const configs = [
    { key: 'PLATFORM_COMMISSION_RATE', value: '0.15', description: 'Default platform commission (15%)', isPublic: false },
    { key: 'MIN_ORDER_WEIGHT_KG', value: '1', description: 'Minimum order weight in kg', isPublic: true },
    { key: 'CURRENCY', value: 'AED', description: 'Platform default currency', isPublic: true },
    { key: 'MAX_SEARCH_RADIUS_KM', value: '20', description: 'Max vendor search radius in km', isPublic: true },
    { key: 'BASE_DELIVERY_FEE', value: '5', description: 'Base delivery fee in AED', isPublic: true },
  ];

  for (const cfg of configs) {
    await prisma.platformConfig.upsert({ where: { key: cfg.key }, update: {}, create: cfg });
  }
  console.log('✅  Platform config seeded');

  console.log('\n🎉  Seed complete!\n');
  console.log('Test credentials:');
  console.log('  Admin:    admin@cykle.app        / Admin@1234!');
  console.log('  Vendor:   vendor@freshpress.ae   / Vendor@1234!');
  console.log('  Customer: customer@example.com   / Customer@1234!');
  console.log('  Driver:   driver@cykle.app       / Driver@1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
