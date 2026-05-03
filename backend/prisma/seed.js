const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed GymFlow ---');

  // =========================
  // 1. USUÁRIOS (UPSERT)
  // =========================
  const tonia = await prisma.usuario.upsert({
    where: { email: 'aluna@gym.com' },
    update: {},
    create: {
      nome: 'Tonia Dias',
      email: 'aluna@gym.com',
      senha: '123',
      role: 'ALUNO',
    },
  });

  const carol = await prisma.usuario.upsert({
    where: { email: 'profe@gym.com' },
    update: {},
    create: {
      nome: 'Carol Silva',
      email: 'profe@gym.com',
      senha: '123',
      role: 'PROFESSOR',
    },
  });

  // =========================
  // 2. EQUIPAMENTOS (UPSERT)
  // =========================
  const legPress = await prisma.equipamento.upsert({
    where: { nome: 'Leg Press' },
    update: {},
    create: {
      nome: 'Leg Press',
      musculoAlvo: 'Quadríceps',
      url: 'https://exemplo.com/leg.png',
    },
  });

  const supino = await prisma.equipamento.upsert({
    where: { nome: 'Supino' },
    update: {},
    create: {
      nome: 'Supino',
      musculoAlvo: 'Peitoral',
      url: 'https://exemplo.com/supino.png',
    },
  });

  // =========================
  // 3. CARGAS (pode manter createMany, mas seguro recriar antes se quiser)
  // =========================
  await prisma.cargaUsuario.deleteMany();

  await prisma.cargaUsuario.createMany({
    data: [
      { usuarioId: tonia.id, equipamentoId: legPress.id, pesoAtual: 100 },
      { usuarioId: tonia.id, equipamentoId: supino.id, pesoAtual: 40 },
    ],
  });

  // =========================
  // 4. TREINOS
  // =========================
  await prisma.treino.deleteMany();

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
