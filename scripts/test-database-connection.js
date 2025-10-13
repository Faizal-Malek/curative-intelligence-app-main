// Database connection test script
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔧 Testing Supabase database connection...\n');
  
  // Display current environment variables (masked for security)
  console.log('Environment variables:');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : 'Not set');
  console.log('DIRECT_URL:', process.env.DIRECT_URL ? 'Set (' + process.env.DIRECT_URL.substring(0, 30) + '...)' : 'Not set');
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set');
  console.log('');

  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Attempting to connect to database...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test query execution
    console.log('Testing query execution...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    console.log('✅ Query execution successful:', result);
    
    // Test if User table exists
    console.log('Checking existing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✅ Existing tables:', tables);
    
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    if (error.message.includes('Tenant or user not found')) {
      console.log('\n🔍 Troubleshooting suggestions:');
      console.log('1. Check if your Supabase project is still active');
      console.log('2. Verify the database password in Supabase dashboard');
      console.log('3. Make sure the project reference ID is correct');
      console.log('4. Check if the database URL format is correct');
      console.log('\n📋 Steps to get correct credentials:');
      console.log('1. Go to https://supabase.com/dashboard');
      console.log('2. Select your project');
      console.log('3. Go to Settings > Database');
      console.log('4. Copy the Connection string (URI)');
      console.log('5. Make sure to use the password you set, not the generated one');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();