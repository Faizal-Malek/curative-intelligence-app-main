const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserTable() {
  try {
    console.log('🔍 Checking User table structure...\n')
    
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position
    `
    
    console.log('User table columns:')
    console.table(columns)
    
    // Check if there are any users
    const userCount = await prisma.user.count()
    console.log(`\n📊 Total users in database: ${userCount}`)
    
    if (userCount > 0) {
      const sampleUsers = await prisma.user.findMany({
        take: 3,
        select: {
          id: true,
          email: true,
          clerkId: true,
          onboardingComplete: true,
          createdAt: true
        }
      })
      console.log('\n👥 Sample users:')
      console.table(sampleUsers)
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserTable()
