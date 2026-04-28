const prisma = require('./prismaClient');

async function main() {
  try {
    console.log('⏳ Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    const userCount = await prisma.user.count();
    console.log(`📊 Current User Count: ${userCount}`);
  } catch (e) {
    console.error('❌ Database connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

