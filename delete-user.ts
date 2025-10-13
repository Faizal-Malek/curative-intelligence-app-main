// File: delete-user.js (create this in the root of your project)

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- IMPORTANT ---
// 1. Run `npx prisma user findMany` to get the ID of the user you want to delete.
// 2. Paste that ID here, replacing the placeholder text.
const userIdToDelete = '686e6ac0d7ca8f9528c66d78';

async function main() {
  if (userIdToDelete === '686e6ac0d7ca8f9528c66d78') {
    console.error('\nError: Please replace the placeholder ID in the script with a real user ID.');
    return;
  }

  try {
    console.log(`Attempting to delete user with ID: ${userIdToDelete}...`);
    
    // This command will find and delete the user with the specified ID.
    const deleteResult = await prisma.user.delete({
      where: {
        id: userIdToDelete,
      },
    });

    console.log('\n✅ Success! User has been deleted from the database.');
    console.log(deleteResult);

  } catch (error: unknown) {
    // This will catch the error if the user is not found, which is fine.
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2025') {
      console.warn(`\nWarning: User with ID "${userIdToDelete}" was not found. They may have already been deleted.`);
    } else {
      console.error('\n❌ An unexpected error occurred:', error);
    }
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

main();
