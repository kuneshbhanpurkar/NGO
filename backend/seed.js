require('dotenv').config();
const prisma = require('./prismaClient');

const bcrypt = require('bcryptjs');

async function seed() {
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const users = [
    { name: 'Admin Account', email: 'admin@example.com', role: 'admin', area: 'Global' },
    { name: 'NGO Coordinator', email: 'ngo@example.com', role: 'ngo', area: 'Downtown' },
    { name: 'Volunteer Account', email: 'volunteer@example.com', role: 'volunteer', area: 'Uptown' },
    { name: 'Regular User', email: 'user@example.com', role: 'user', area: 'Midtown' },
  ];

  console.log('🌱 Seeding database with test accounts...');

  for (const userData of users) {
    try {
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: hashedPassword,
        },
      });
      console.log(`✅ Created/Verified ${userData.role}: ${userData.email}`);
    } catch (error) {
      console.error(`❌ Error creating ${userData.role}:`, error.message);
    }
  }

  console.log('🏁 Seeding completed!');
  await prisma.$disconnect();
}

seed();
