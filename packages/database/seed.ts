import { PrismaClient } from './generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin user
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@fooddupe.nl',
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: superAdminPassword,
      role: 'SUPERADMIN',
    },
  });

  // Create test tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Pizza Mario',
      subdomain: 'pizzamario',
      email: 'owner@pizzamario.nl',
      phone: '036-841-4025',
      status: 'ACTIVE',
      plan: 'professional',
    },
  });

  // Create tenant settings
  await prisma.tenantSettings.create({
    data: {
      tenantId: tenant.id,
      currency: 'EUR',
      timezone: 'Europe/Amsterdam',
      deliveryFee: 2.50,
      freeDeliveryThreshold: 20.00,
      taxRate: 0.21,
      primaryColor: '#dc2626',
      enableDelivery: true,
      enablePickup: true,
    },
  });

  // Create location
  const location = await prisma.location.create({
    data: {
      tenantId: tenant.id,
      name: 'Pizza Mario Centrum',
      address: 'Zandstraat 15',
      city: 'Almere',
      postalCode: '1334 HD',
      phone: '036-841-4025',
      email: 'centrum@pizzamario.nl',
    },
  });

  // Create owner user
  const ownerPassword = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'owner@pizzamario.nl',
      firstName: 'Mario',
      lastName: 'Rossi',
      passwordHash: ownerPassword,
      role: 'OWNER',
      locationId: location.id,
    },
  });

  // Create employee user
  const employeePassword = await bcrypt.hash('employee123', 10);
  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: 'kassier@pizzamario.nl',
      firstName: 'Giovanni',
      lastName: 'Bianchi',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      locationId: location.id,
    },
  });

  // Create categories
  const pizzaCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Pizza\'s',
      slug: 'pizzas',
      sortOrder: 1,
    },
  });

  const pastaCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Pasta',
      slug: 'pasta',
      sortOrder: 2,
    },
  });

  const drinkCategory = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name: 'Dranken',
      slug: 'drinks',
      sortOrder: 3,
    },
  });

  // Create products
  const pizzas = [
    { name: 'Margherita', description: 'Tomatensaus, mozzarella, verse basilicum', price: 12.50, isPopular: true },
    { name: 'Pepperoni', description: 'Tomatensaus, mozzarella, pepperoni', price: 15.00, isPopular: false },
    { name: 'Quattro Stagioni', description: 'Tomatensaus, mozzarella, ham, champignons, artisjokken, olijven', price: 18.50, isPopular: true },
    { name: 'Hawaii', description: 'Tomatensaus, mozzarella, ham, ananas', price: 16.00, isPopular: false },
    { name: 'Diavola', description: 'Tomatensaus, mozzarella, salami piccante', price: 16.50, isPopular: true },
  ];

  for (const pizza of pizzas) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: pizzaCategory.id,
        ...pizza,
      },
    });
  }

  const pastas = [
    { name: 'Spaghetti Carbonara', description: 'Romige saus met spek, ei en parmezaanse kaas', price: 14.50, isPopular: true },
    { name: 'Penne Bolognese', description: 'Traditionele vleessaus met verse kruiden', price: 13.50, isPopular: true },
    { name: 'Penne Arrabbiata', description: 'Pittige tomatensaus met knoflook en rode peper', price: 13.00, isPopular: false },
    { name: 'Spaghetti Aglio e Olio', description: 'Olijfolie, knoflook, peterselie en rode peper', price: 12.00, isPopular: false },
  ];

  for (const pasta of pastas) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: pastaCategory.id,
        ...pasta,
      },
    });
  }

  const drinks = [
    { name: 'Coca Cola', description: 'Frisdrank 330ml', price: 2.50, isPopular: true },
    { name: 'Fanta', description: 'Sinaasappel frisdrank 330ml', price: 2.50, isPopular: false },
    { name: 'Sprite', description: 'Citrus frisdrank 330ml', price: 2.50, isPopular: false },
    { name: 'Water', description: 'Spa rood 500ml', price: 2.00, isPopular: false },
    { name: 'Heineken', description: 'Nederlandse pils 330ml', price: 3.50, isPopular: true },
  ];

  for (const drink of drinks) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: drinkCategory.id,
        ...drink,
      },
    });
  }

  // Create test customer
  await prisma.customer.create({
    data: {
      tenantId: tenant.id,
      email: 'klant@example.com',
      firstName: 'Jan',
      lastName: 'de Vries',
      phone: '06-12345678',
      address: 'Teststraat 123',
      city: 'Almere',
      postalCode: '1234 AB',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log(`\n📧 Login credentials:`);
  console.log(`   Super Admin: admin@fooddupe.nl / admin123`);
  console.log(`   Restaurant Owner: owner@pizzamario.nl / password123`);
  console.log(`   Employee: kassier@pizzamario.nl / employee123`);
  console.log(`\n🏪 Test tenant: pizzamario`);
  console.log(`🌐 Customer website: http://pizzamario.localhost`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });