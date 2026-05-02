const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes para evitar duplicados ao rodar novamente
  await prisma.treinoEquipamento.deleteMany();
  await prisma.cargaUsuario.deleteMany();
  await prisma.treino.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.equipamento.deleteMany();

  console.log('--- Iniciando Seed GymFlow ---');

  // 1. Criar Usuários
  const tonia = await prisma.usuario.create({
    data: {
      nome: 'Tonia Dias',
      email: 'aluna@gym.com',
      senha: '123',
      role: 'ALUNO',
    },
  });

  const carol = await prisma.usuario.create({
    data: {
      nome: 'Carol Silva',
      email: 'profe@gym.com',
      senha: '123',
      role: 'PROFESSOR',
    },
  });

  // 2. Criar Equipamentos
  const legPress = await prisma.equipamento.create({
    data: {
      nome: 'Leg Press',
      musculoAlvo: 'Quadríceps',
      url: 'https://exemplo.com/leg.png',
    },
  });

  const supino = await prisma.equipamento.create({
    data: {
      nome: 'Supino',
      musculoAlvo: 'Peitoral',
      url: 'https://exemplo.com/supino.png',
    },
  });

  // 3. Definir Cargas Personalizadas (O peso de base da Tonia)
  await prisma.cargaUsuario.createMany({
    data: [
      { usuarioId: tonia.id, equipamentoId: legPress.id, pesoAtual: 100 },
      { usuarioId: tonia.id, equipamentoId: supino.id, pesoAtual: 40 },
    ],
  });

  // 4. Criar Treino com Pesos Específicos (TreinoEquipamento)
  await prisma.treino.create({
    data: {
      usuarioId: tonia.id,
      exercise: 'Treino A - Performance',
      prescribed_intensity: 'Moderada',
      status: 'PENDENTE',
      equipamentos: {
        create: [
          { equipamentoId: legPress.id, cargaPlanejada: 100 },
          { equipamentoId: supino.id, cargaPlanejada: 40 },
        ],
      },
    },
  });

  console.log('Banco de dados populado!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
