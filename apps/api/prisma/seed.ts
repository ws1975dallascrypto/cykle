import { PrismaClient, UserRole, VehicleType, ServiceType, PricingType } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding Cykle PH database...');

  // ── Super Admin ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@1234!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cykle.ph' },
    update: {},
    create: {
      email: 'admin@cykle.ph',
      phone: '+639170000001',
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      isVerified: true,
    },
  });
  console.log(`✅  Admin: ${admin.email}`);

  // ── Vendors ────────────────────────────────────────────────────────────────
  const vendorPassword = await bcrypt.hash('Vendor@1234!', 12);

  // Vendor 1 — BGC, Taguig
  const vendor1 = await prisma.user.upsert({
    where: { email: 'vendor@cleanexpress.ph' },
    update: {},
    create: {
      email: 'vendor@cleanexpress.ph',
      phone: '+639170000002',
      passwordHash: vendorPassword,
      role: UserRole.VENDOR,
      firstName: 'Maria',
      lastName: 'Santos',
      isVerified: true,
      vendorProfile: {
        create: {
          shopName: 'Clean Express BGC',
          description: 'Premium laundry & dry cleaning service in the heart of BGC. Same-day express available.',
          street: '32nd Street, Bonifacio Global City',
          city: 'Taguig',
          province: 'Metro Manila',
          country: 'Philippines',
          postalCode: '1634',
          latitude: 14.5547,
          longitude: 121.0509,
          isOpen: true,
          isVerified: true,
          rating: 4.9,
          totalReviews: 428,
          commissionRate: 0.15,
          expressSurcharge: 1.5,
          operatingHours: {
            monday:    { isOpen: true,  openTime: '07:00', closeTime: '21:00' },
            tuesday:   { isOpen: true,  openTime: '07:00', closeTime: '21:00' },
            wednesday: { isOpen: true,  openTime: '07:00', closeTime: '21:00' },
            thursday:  { isOpen: true,  openTime: '07:00', closeTime: '21:00' },
            friday:    { isOpen: true,  openTime: '07:00', closeTime: '22:00' },
            saturday:  { isOpen: true,  openTime: '08:00', closeTime: '22:00' },
            sunday:    { isOpen: true,  openTime: '09:00', closeTime: '20:00' },
          },
        },
      },
    },
    include: { vendorProfile: true },
  });

  const vp1 = vendor1.vendorProfile!;

  // BGC Services (PHP pricing)
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      { id: 'svc-bgc-001', vendorProfileId: vp1.id, name: 'Wash & Fold', description: 'Machine washed, tumble dried, neatly folded', serviceType: ServiceType.WASH_AND_FOLD, pricingType: PricingType.PER_KG, basePrice: 85, unit: 'kg', minQuantity: 1, turnaroundHours: 24, isActive: true, displayOrder: 1 },
      { id: 'svc-bgc-002', vendorProfileId: vp1.id, name: 'Wash & Iron',  description: 'Washed and pressed to perfection',              serviceType: ServiceType.WASH_AND_IRON,  pricingType: PricingType.PER_KG, basePrice: 120, unit: 'kg', minQuantity: 1, turnaroundHours: 24, isActive: true, displayOrder: 2 },
      { id: 'svc-bgc-003', vendorProfileId: vp1.id, name: 'Dry Cleaning', description: 'Professional dry clean for delicate garments',   serviceType: ServiceType.DRY_CLEAN,      pricingType: PricingType.PER_ITEM, basePrice: 150, unit: 'item', turnaroundHours: 48, isActive: true, displayOrder: 3 },
      { id: 'svc-bgc-004', vendorProfileId: vp1.id, name: 'Press Only',   description: 'Steam ironing and pressing only',                serviceType: ServiceType.PRESS_ONLY,     pricingType: PricingType.PER_ITEM, basePrice: 40,  unit: 'item', turnaroundHours: 12, isActive: true, displayOrder: 4 },
      { id: 'svc-bgc-005', vendorProfileId: vp1.id, name: 'Express Wash', description: '4-hour turnaround — washed, dried & folded',    serviceType: ServiceType.EXPRESS,        pricingType: PricingType.PER_KG, basePrice: 150, unit: 'kg', minQuantity: 1, turnaroundHours: 4, isActive: true, isExpress: true, displayOrder: 5 },
      { id: 'svc-bgc-006', vendorProfileId: vp1.id, name: 'Duvet & Bedding', description: 'Comforters, blankets, pillow cases',        serviceType: ServiceType.DUVET_BEDDING,  pricingType: PricingType.PER_ITEM, basePrice: 350, unit: 'item', turnaroundHours: 48, isActive: true, displayOrder: 6 },
    ],
  });

  // Dry Cleaning items for BGC
  await prisma.serviceItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'si-bgc-001', serviceId: 'svc-bgc-003', name: 'Polo Shirt',       pricePerItem: 150, displayOrder: 1 },
      { id: 'si-bgc-002', serviceId: 'svc-bgc-003', name: 'Dress Shirt',       pricePerItem: 150, displayOrder: 2 },
      { id: 'si-bgc-003', serviceId: 'svc-bgc-003', name: 'Slacks / Trousers', pricePerItem: 180, displayOrder: 3 },
      { id: 'si-bgc-004', serviceId: 'svc-bgc-003', name: 'Dress / Gown',      pricePerItem: 350, displayOrder: 4 },
      { id: 'si-bgc-005', serviceId: 'svc-bgc-003', name: 'Barong Tagalog',    pricePerItem: 250, displayOrder: 5 },
      { id: 'si-bgc-006', serviceId: 'svc-bgc-003', name: 'Blazer / Coat',     pricePerItem: 280, displayOrder: 6 },
      { id: 'si-bgc-007', serviceId: 'svc-bgc-003', name: 'Suit (2-piece)',    pricePerItem: 500, displayOrder: 7 },
      { id: 'si-bgc-008', serviceId: 'svc-bgc-003', name: 'Leather Jacket',    pricePerItem: 600, displayOrder: 8 },
    ],
  });

  // Press Only items
  await prisma.serviceItem.createMany({
    skipDuplicates: true,
    data: [
      { id: 'si-bgc-p01', serviceId: 'svc-bgc-004', name: 'Shirt',             pricePerItem: 40,  displayOrder: 1 },
      { id: 'si-bgc-p02', serviceId: 'svc-bgc-004', name: 'Trousers',          pricePerItem: 50,  displayOrder: 2 },
      { id: 'si-bgc-p03', serviceId: 'svc-bgc-004', name: 'Dress',             pricePerItem: 80,  displayOrder: 3 },
      { id: 'si-bgc-p04', serviceId: 'svc-bgc-004', name: 'Barong Tagalog',    pricePerItem: 100, displayOrder: 4 },
    ],
  });
  console.log(`✅  Vendor 1: ${vp1.shopName}`);

  // Vendor 2 — Makati CBD
  const vendor2 = await prisma.user.upsert({
    where: { email: 'vendor@sudsandshine.ph' },
    update: {},
    create: {
      email: 'vendor@sudsandshine.ph',
      phone: '+639170000003',
      passwordHash: vendorPassword,
      role: UserRole.VENDOR,
      firstName: 'Jose',
      lastName: 'Reyes',
      isVerified: true,
      vendorProfile: {
        create: {
          shopName: 'Suds & Shine Makati',
          description: 'Affordable quality laundry near Ayala Ave. Walk-in or schedule a pickup.',
          street: 'Gil Puyat Avenue, Bel-Air',
          city: 'Makati',
          province: 'Metro Manila',
          country: 'Philippines',
          postalCode: '1209',
          latitude: 14.5567,
          longitude: 121.0147,
          isOpen: true,
          isVerified: true,
          rating: 4.6,
          totalReviews: 210,
          commissionRate: 0.15,
          operatingHours: {
            monday:    { isOpen: true, openTime: '08:00', closeTime: '20:00' },
            tuesday:   { isOpen: true, openTime: '08:00', closeTime: '20:00' },
            wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
            thursday:  { isOpen: true, openTime: '08:00', closeTime: '20:00' },
            friday:    { isOpen: true, openTime: '08:00', closeTime: '20:00' },
            saturday:  { isOpen: true, openTime: '09:00', closeTime: '19:00' },
            sunday:    { isOpen: false },
          },
        },
      },
    },
    include: { vendorProfile: true },
  });

  const vp2 = vendor2.vendorProfile!;
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      { id: 'svc-mkt-001', vendorProfileId: vp2.id, name: 'Wash & Fold',  description: 'Standard wash and fold service',             serviceType: ServiceType.WASH_AND_FOLD, pricingType: PricingType.PER_KG, basePrice: 80,  unit: 'kg', minQuantity: 1, turnaroundHours: 24, isActive: true, displayOrder: 1 },
      { id: 'svc-mkt-002', vendorProfileId: vp2.id, name: 'Wash & Iron',  description: 'Wash and steam press',                       serviceType: ServiceType.WASH_AND_IRON,  pricingType: PricingType.PER_KG, basePrice: 110, unit: 'kg', minQuantity: 1, turnaroundHours: 24, isActive: true, displayOrder: 2 },
      { id: 'svc-mkt-003', vendorProfileId: vp2.id, name: 'Dry Cleaning', description: 'Dry clean for formal and delicate wear',      serviceType: ServiceType.DRY_CLEAN,     pricingType: PricingType.PER_ITEM, basePrice: 140, unit: 'item', turnaroundHours: 48, isActive: true, displayOrder: 3 },
    ],
  });
  console.log(`✅  Vendor 2: ${vp2.shopName}`);

  // Vendor 3 — Quezon City
  const vendor3 = await prisma.user.upsert({
    where: { email: 'vendor@freshfold.ph' },
    update: {},
    create: {
      email: 'vendor@freshfold.ph',
      phone: '+639170000004',
      passwordHash: vendorPassword,
      role: UserRole.VENDOR,
      firstName: 'Ana',
      lastName: 'Garcia',
      isVerified: true,
      vendorProfile: {
        create: {
          shopName: 'FreshFold QC',
          description: 'Your trusted laundry partner in Quezon City. Bulk-friendly rates.',
          street: 'Tomas Morato Avenue, Brgy. South Triangle',
          city: 'Quezon City',
          province: 'Metro Manila',
          country: 'Philippines',
          postalCode: '1103',
          latitude: 14.6349,
          longitude: 121.0339,
          isOpen: true,
          isVerified: true,
          rating: 4.7,
          totalReviews: 183,
          commissionRate: 0.15,
          operatingHours: {
            monday:    { isOpen: true, openTime: '07:00', closeTime: '21:00' },
            tuesday:   { isOpen: true, openTime: '07:00', closeTime: '21:00' },
            wednesday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
            thursday:  { isOpen: true, openTime: '07:00', closeTime: '21:00' },
            friday:    { isOpen: true, openTime: '07:00', closeTime: '21:00' },
            saturday:  { isOpen: true, openTime: '08:00', closeTime: '21:00' },
            sunday:    { isOpen: true, openTime: '09:00', closeTime: '18:00' },
          },
        },
      },
    },
    include: { vendorProfile: true },
  });

  const vp3 = vendor3.vendorProfile!;
  await prisma.service.createMany({
    skipDuplicates: true,
    data: [
      { id: 'svc-qc-001', vendorProfileId: vp3.id, name: 'Wash & Fold', description: 'Bulk-friendly wash and fold',               serviceType: ServiceType.WASH_AND_FOLD,  pricingType: PricingType.PER_KG, basePrice: 75, unit: 'kg', minQuantity: 3, turnaroundHours: 24, isActive: true, displayOrder: 1 },
      { id: 'svc-qc-002', vendorProfileId: vp3.id, name: 'Wash & Iron', description: 'Wash and steam iron',                       serviceType: ServiceType.WASH_AND_IRON,  pricingType: PricingType.PER_KG, basePrice: 100, unit: 'kg', minQuantity: 1, turnaroundHours: 24, isActive: true, displayOrder: 2 },
      { id: 'svc-qc-003', vendorProfileId: vp3.id, name: 'Stain Removal', description: 'Pre-treatment for tough stains',         serviceType: ServiceType.STAIN_REMOVAL,  pricingType: PricingType.FLAT_RATE, basePrice: 150, unit: 'treatment', turnaroundHours: 24, isActive: true, displayOrder: 3 },
      { id: 'svc-qc-004', vendorProfileId: vp3.id, name: 'Duvet & Comforter', description: 'Heavy item washing service',        serviceType: ServiceType.DUVET_BEDDING,  pricingType: PricingType.PER_ITEM, basePrice: 300, unit: 'item', turnaroundHours: 48, isActive: true, displayOrder: 4 },
    ],
  });
  console.log(`✅  Vendor 3: ${vp3.shopName}`);

  // ── Customer ───────────────────────────────────────────────────────────────
  const customerPassword = await bcrypt.hash('Customer@1234!', 12);
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      phone: '+639171234567',
      passwordHash: customerPassword,
      role: UserRole.CUSTOMER,
      firstName: 'Juan',
      lastName: 'dela Cruz',
      isVerified: true,
      customerProfile: {
        create: {
          garmentPreferences: {
            detergentType: 'SENSITIVE',
            waterTemperature: 'COLD',
            dryingMethod: 'TUMBLE_DRY',
            foldingPreference: 'FOLDED',
            starchLevel: 'LIGHT',
          },
          addresses: {
            create: [
              {
                label: 'Home',
                street: '24 Burgos Circle',
                building: 'One Serendra East Tower',
                floor: '12th Floor',
                barangay: 'Brgy. Fort Bonifacio',
                city: 'Taguig',
                province: 'Metro Manila',
                country: 'Philippines',
                postalCode: '1634',
                latitude: 14.5530,
                longitude: 121.0489,
                isDefault: true,
                landmark: 'Near Bonifacio High Street',
              },
              {
                label: 'Office',
                street: 'Ayala Avenue',
                building: 'GT Tower International',
                floor: '8th Floor',
                barangay: 'Brgy. Bel-Air',
                city: 'Makati',
                province: 'Metro Manila',
                country: 'Philippines',
                postalCode: '1209',
                latitude: 14.5553,
                longitude: 121.0161,
                isDefault: false,
              },
            ],
          },
        },
      },
    },
  });
  console.log('✅  Customer: Juan dela Cruz (BGC)');

  // ── Drivers ────────────────────────────────────────────────────────────────
  const driverPassword = await bcrypt.hash('Driver@1234!', 12);

  await prisma.user.upsert({
    where: { email: 'driver1@cykle.ph' },
    update: {},
    create: {
      email: 'driver1@cykle.ph',
      phone: '+639189876543',
      passwordHash: driverPassword,
      role: UserRole.DRIVER,
      firstName: 'Roberto',
      lastName: 'Mendoza',
      isVerified: true,
      driverProfile: {
        create: {
          vehicleType: VehicleType.MOTORCYCLE,
          vehiclePlate: '1A2-B345',
          vehicleModel: 'Honda Click 125i',
          licenseNumber: 'N01-23-456789',
          isOnline: true,
          currentLat: 14.5560,
          currentLng: 121.0480,
          rating: 4.9,
          totalReviews: 134,
          totalDeliveries: 512,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'driver2@cykle.ph' },
    update: {},
    create: {
      email: 'driver2@cykle.ph',
      phone: '+639219988776',
      passwordHash: driverPassword,
      role: UserRole.DRIVER,
      firstName: 'Carlo',
      lastName: 'Bautista',
      isVerified: true,
      driverProfile: {
        create: {
          vehicleType: VehicleType.MOTORCYCLE,
          vehiclePlate: '2C3-D678',
          vehicleModel: 'Yamaha Mio 125',
          licenseNumber: 'N01-23-789012',
          isOnline: true,
          currentLat: 14.5580,
          currentLng: 121.0160,
          rating: 4.7,
          totalReviews: 89,
          totalDeliveries: 278,
        },
      },
    },
  });
  console.log('✅  Drivers seeded (2 online)');

  // ── Platform Config ────────────────────────────────────────────────────────
  const configs = [
    { key: 'PLATFORM_COMMISSION_RATE', value: '0.15',         description: 'Default platform commission (15%)',       isPublic: false },
    { key: 'MIN_ORDER_WEIGHT_KG',      value: '1',            description: 'Minimum order weight in kg',             isPublic: true  },
    { key: 'CURRENCY',                 value: 'PHP',          description: 'Platform default currency',              isPublic: true  },
    { key: 'CURRENCY_SYMBOL',          value: '₱',            description: 'Currency symbol',                        isPublic: true  },
    { key: 'LOCALE',                   value: 'en-PH',        description: 'Platform locale',                        isPublic: true  },
    { key: 'TIMEZONE',                 value: 'Asia/Manila',  description: 'Platform timezone',                      isPublic: true  },
    { key: 'MAX_SEARCH_RADIUS_KM',     value: '20',           description: 'Max vendor search radius in km',         isPublic: true  },
    { key: 'BASE_DELIVERY_FEE',        value: '50',           description: 'Base delivery fee in PHP',               isPublic: true  },
    { key: 'DELIVERY_RATE_PER_KM',     value: '15',           description: 'Delivery fee per km in PHP',             isPublic: true  },
    { key: 'SUPPORT_PHONE',            value: '+6328001234',  description: 'Customer support hotline',               isPublic: true  },
    { key: 'SUPPORT_EMAIL',            value: 'help@cykle.ph', description: 'Customer support email',              isPublic: true  },
  ];

  for (const cfg of configs) {
    await prisma.platformConfig.upsert({ where: { key: cfg.key }, update: {}, create: cfg });
  }
  console.log('✅  Platform config seeded (PH locale)');

  console.log('\n🎉  Seed complete!\n');
  console.log('Test credentials:');
  console.log('  Admin:    admin@cykle.ph          / Admin@1234!');
  console.log('  Vendor 1: vendor@cleanexpress.ph  / Vendor@1234!  (BGC, Taguig)');
  console.log('  Vendor 2: vendor@sudsandshine.ph  / Vendor@1234!  (Makati)');
  console.log('  Vendor 3: vendor@freshfold.ph     / Vendor@1234!  (Quezon City)');
  console.log('  Customer: customer@example.com    / Customer@1234!');
  console.log('  Driver 1: driver1@cykle.ph        / Driver@1234!');
  console.log('  Driver 2: driver2@cykle.ph        / Driver@1234!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
