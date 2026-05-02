const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRaw`
    UPDATE "Usuario"
    SET role = 'ALUNO'
    WHERE role = 'ALUNA'
  `;

  console.log('Dados corrigidos!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
