const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'FARMER' } });
  
  for (let u of users) {
    if (u.phone) {
      const normalized = u.phone.replace(/[\s()-]/g, '');
      if (normalized !== u.phone) {
        try {
          await prisma.user.update({ where: { id: u.id }, data: { phone: normalized } });
          console.log(`Updated User ID ${u.id}: ${u.phone} -> ${normalized}`);
        } catch (e) {
          console.log(`Failed to update User ID ${u.id}: maybe duplicate exists for ${normalized}`);
          if (e.code === 'P2002') {
             console.log(`Deleting duplicate User ID ${u.id} because ${normalized} already exists.`);
             // Before deleting user, delete their related data
             await prisma.task.deleteMany({ where: { farmerId: u.id } });
             await prisma.crop.deleteMany({ where: { farmerId: u.id } });
             await prisma.user.delete({ where: { id: u.id } });
          }
        }
      }
    }
  }
  console.log("Normalization complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
