require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const SECRET = 'gymflow_secret';
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token não informado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido',
    });
  }
}

function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token não informado',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);

    if (decoded.role !== 'PROFESSOR') {
      return res.status(403).json({
        error: 'Acesso permitido apenas para professores',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido',
    });
  }
}

// --- ENDPOINTS ---
// --- AUTENTICAÇÃO ---
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    console.log('Tentativa de login:', req.body);

    const user = await prisma.usuario.findUnique({
      where: { email: email },
    });

    if (user && user.senha === senha) {
      console.log(`[AUTH] Sucesso: ${user.nome} (${user.role})`);
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        SECRET,
        {
          expiresIn: '1d',
        },
      );

      return res.json({
        ...user,
        token: `Bearer ${token}`,
      });
    }

    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  } catch (err) {
    console.error('[AUTH ERROR]:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});
// ---

// --- USUÁRIOS ---
app.get('/usuarios', authMiddleware, async (req, res) => {
  const usuarios = await prisma.usuario.findMany();
  res.json(usuarios);
});

app.post('/usuarios', async (req, res) => {
  try {
    const novo = await prisma.usuario.create({
      data: req.body,
    });
    res.status(201).json(novo);
  } catch (error) {
    res
      .status(400)
      .json({ error: 'Erro ao criar usuário ou e-mail já existe' });
  }
});

app.put('/usuarios/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const atualizado = await prisma.usuario.update({
      where: { id },
      data: req.body,
    });
    res.json(atualizado);
  } catch (error) {
    res.status(404).send('Usuário não encontrado');
  }
});

app.delete('/usuarios/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.usuario.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(404).send('Usuário não encontrado');
  }
});
// ---

// --- EQUIPAMENTOS ---
app.get('/equipamentos', adminMiddleware, async (req, res) => {
  const lista = await prisma.equipamento.findMany();
  res.json(lista);
});

app.post('/equipamentos', adminMiddleware, async (req, res) => {
  try {
    const novo = await prisma.equipamento.create({ data: req.body });
    res.status(201).json(novo);
  } catch (error) {
    res
      .status(400)
      .json({ error: 'Erro ao criar equipamento. Verifique os dados.' });
  }
});
// ---

// --- TREINOS ---
app.get('/treinos', authMiddleware, async (req, res) => {
  const { usuarioId } = req.query;

  try {
    const treinos = await prisma.treino.findMany({
      where: {
        usuarioId: usuarioId,
        // Dica de QA: Ative o 'concluido: false' se quiser listar apenas o treino atual no card
      },
      include: {
        equipamentos: {
          include: {
            equipamento: true, // Crucial: Isso traz os detalhes (nome, musculoAlvo) da máquina
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 7, // Mantém o histórico dos últimos 7 para o gráfico de performance
    });

    res.json(treinos);
  } catch (error) {
    console.error('Erro ao buscar treinos:', error);
    res.status(500).json({ error: 'Erro ao carregar lista de treinos.' });
  }
});

app.post('/treinos', adminMiddleware, async (req, res) => {
  const {
    usuarioId,
    exercise,
    prescribed_intensity,
    equipamentosSelecionados,
    acao, // 'MANTER' ou 'CRIAR'
  } = req.body;

  try {
    // 1. Localiza o último treino para servir de base
    const ultimo = await prisma.treino.findFirst({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: { equipamentos: true },
    });

    let dadosNovoTreino = {
      usuarioId,
      status: 'PENDENTE',
      concluido: false,
    };

    // MODO MANTER: Copia os dados e as cargas do último treino
    if (acao === 'MANTER') {
      if (!ultimo)
        return res
          .status(404)
          .json({ error: 'Sem treino anterior para manter.' });

      dadosNovoTreino = {
        ...dadosNovoTreino,
        exercise: ultimo.exercise,
        prescribed_intensity: ultimo.prescribed_intensity,
        equipamentos: {
          create: ultimo.equipamentos.map((item) => ({
            equipamentoId: item.equipamentoId,
            cargaPlanejada: item.cargaPlanejada, // Mantém a carga anterior
          })),
        },
      };
    }
    // MODO AJUSTAR (OU NOVO): Usa os dados enviados pelo Professor/IA
    else {
      if (!equipamentosSelecionados || equipamentosSelecionados.length === 0) {
        return res
          .status(400)
          .json({ error: 'Selecione ao menos um equipamento com carga.' });
      }

      dadosNovoTreino = {
        ...dadosNovoTreino,
        exercise: exercise || 'Novo Treino',
        prescribed_intensity: prescribed_intensity || 'Moderada',
        equipamentos: {
          create: equipamentosSelecionados
            .filter((item) => item.id)
            .map((item) => ({
              equipamentoId: item.id,
              cargaPlanejada: Math.round(Number(item.carga)),
            })),
        },
      };
    }

    const novoTreino = await prisma.treino.create({
      data: dadosNovoTreino,
      include: { equipamentos: { include: { equipamento: true } } },
    });

    res.status(201).json(novoTreino);
  } catch (error) {
    console.error('Erro no fluxo de criação:', error.message);
    res.status(500).json({ error: 'Falha ao processar novo treino.' });
  }
});

app.patch('/treinos/:id/iniciar', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const treinoIniciado = await prisma.treino.update({
      where: { id },
      data: {
        status: 'EM_ANDAMENTO',
        dataInicio: new Date(),
      },
      include: {
        equipamentos: { include: { equipamento: true } },
      },
    });
    res.json(treinoIniciado);
  } catch (error) {
    res.status(404).json({ error: 'Treino não localizado' });
  }
});
// ---

// --- FEEDBACKS E SINCRONIZAÇÃO ---
app.post('/feedbacks/finalizar', authMiddleware, async (req, res) => {
  const { treinoId, pse, statusPSE, detalhesEquipamentos } = req.body;

  try {
    const treinoExistente = await prisma.treino.findUnique({
      where: { id: treinoId },
    });

    if (!treinoExistente) {
      return res.status(404).json({ error: 'Treino não encontrado' });
    }

    if (treinoExistente?.concluido) {
      return res.status(403).json({
        error: 'Este treino já foi finalizado e não pode ser alterado.',
      });
    }

    // 1. Cálculo de Duração (QA: Garantindo que o tempo seja registrado corretamente)
    const dataFim = new Date();
    const inicio = treinoExistente.dataInicio || treinoExistente.createdAt;
    const duracaoMs = dataFim - new Date(inicio);
    const duracaoMinutos = Math.max(1, Math.floor(duracaoMs / 60000));

    // 2. Atualização Simplificada (Apenas Status e Esforço)
    const [treinoAtualizado] = await prisma.$transaction([
      prisma.treino.update({
        where: { id: treinoId },
        data: {
          pse: pse,
          statusPSE: statusPSE,
          dataFeedback: dataFim,
          duracaoMinutos: duracaoMinutos,
          status: 'CONCLUIDO',
          concluido: true,
        },
        include: { equipamentos: { include: { equipamento: true } } },
      }),
      ...detalhesEquipamentos.map((detalhe) =>
        prisma.treinoEquipamento.update({
          where: {
            treinoId_equipamentoId: {
              treinoId: treinoId,
              equipamentoId: detalhe.equipamentoId,
            },
          },
          data: {
            pesoRealizado: detalhe.pesoRealizado,
            repeticoes: detalhe.repeticoes,
            series: detalhe.series,
          },
        }),
      ),
    ]);

    res.json(treinoAtualizado);
  } catch (error) {
    console.error('Erro ao finalizar treino:', error);
    res
      .status(500)
      .json({ error: 'Erro interno ao processar o fim do treino' });
  }
});

app.patch('/feedbacks/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status, notaRecuperacao } = req.body;
  const notaPSR = parseInt(notaRecuperacao);

  try {
    // 1. Recupera o treino para checar o PSE gravado anteriormente
    const treinoExistente = await prisma.treino.findUnique({
      where: { id },
      include: { equipamentos: true },
    });

    // 2. Lógica de Progressão (IA-Driven)
    let multiplicadorIA = 1.0;

    // REGRA: Só aumenta se o treino foi leve (PSE <= 4) E a recuperação foi alta (PSR >= 8)
    if (treinoExistente.pse <= 4 && notaPSR >= 8) {
      multiplicadorIA = 1.15; // +15% de carga para o próximo
    } else if (treinoExistente.pse >= 9) {
      multiplicadorIA = 0.85; // Redução de carga se o treino foi exaustivo
    }

    // 3. Atualização Atômica
    const treinoAtualizado = await prisma.treino.update({
      where: { id },
      data: {
        status24h: status,
        notaRecuperacao24h: notaPSR,
        concluido: true,
        equipamentos: {
          update: treinoExistente.equipamentos.map((item) => ({
            where: { id: item.id },
            data: {
              cargaSugerida: Math.round(item.cargaPlanejada * multiplicadorIA),
            },
          })),
        },
      },
      include: { equipamentos: true },
    });

    res.json(treinoAtualizado);
  } catch (error) {
    res.status(404).send('Erro ao atualizar feedback de 24h e calcular carga');
  }
});
// ---

// --- RELATÓRIOS (PERFORMANCE REAL) ---
app.get('/relatorios/performance', adminMiddleware, async (req, res) => {
  const { usuarioId } = req.query;

  try {
    const treinos = await prisma.treino.findMany({
      where: {
        usuarioId: usuarioId,
        status: 'CONCLUIDO',
        pse: { not: null },
      },
      orderBy: { dataFeedback: 'desc' },
    });

    if (treinos.length === 0) {
      return res.json({
        variabilidadeSemanal: [null, null, null, null, null, null, null],
        cicloCompleto: true,
      });
    }

    // Array de objetos para armazenar os detalhes de cada dia da semana
    let historicoDetalhado = [null, null, null, null, null, null, null];
    let variabilidadeSemanal = [null, null, null, null, null, null, null];

    treinos.forEach((t) => {
      const dataRaw = t.dataInicio
        ? new Date(t.dataInicio)
        : new Date(t.createdAt);
      const dataLocal = new Date(
        dataRaw.getTime() - dataRaw.getTimezoneOffset() * 60000,
      );
      const diaSemana = dataLocal.getUTCDay();
      const indice = diaSemana === 0 ? 6 : diaSemana - 1;

      // Cálculo da divergência específica deste treino
      const cargaPlanejada = t.equipamentos?.[0]?.cargaPlanejada || 1;
      const divergencia = Math.round((t.pse / cargaPlanejada - 1) * 100);

      // Preenchemos os dados detalhados para este dia
      if (!historicoDetalhado[indice]) {
        // Garante que pega o treino mais recente se houver + de 1 no dia
        historicoDetalhado[indice] = {
          pse: t.pse,
          psr: t.notaRecuperacao24h || 0,
          divergenciaCarga: `${divergencia > 0 ? '+' : ''}${divergencia}%`,
          statusGeral: t.status24h || 'Estável',
          cicloCompleto: !!t.concluido,
          duracaoMinutos: t.duracaoMinutos,
        };
        variabilidadeSemanal[indice] = t.pse;
      }
    });

    const ultimo = treinos[0];
    const isCicloRealmenteCompleto =
      !!ultimo.concluido && !!ultimo.notaRecuperacao24h;

    res.json({
      // Dados para o estado inicial dos cards (último treino realizado)
      prontidao: ultimo.notaRecuperacao24h || 0,
      divergenciaCarga: `${Math.round((ultimo.pse / ultimo.cargaPlanejada - 1) * 100)}%`,
      statusGeral: ultimo.status24h || 'Aguardando PSR 24h',
      psr: ultimo.notaRecuperacao24h || 0,
      fadiga: ultimo.pse || 0,
      cicloCompleto: isCicloRealmenteCompleto,
      duracaoMinutos: ultimo.duracaoMinutos,

      variabilidadeSemanal: variabilidadeSemanal,
      historicoDetalhado: historicoDetalhado,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados no Prisma' });
  }
});
// ---

// --- CONSULTA DE PERFORMANCE (SUGESTÃO) ---
app.get('/sugerir-carga/:alunoId', adminMiddleware, async (req, res) => {
  const { alunoId } = req.params;

  try {
    const ultimoTreino = await prisma.treino.findFirst({
      where: { usuarioId: alunoId, concluido: true },
      include: { equipamentos: { include: { equipamento: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (!ultimoTreino)
      return res.status(404).json({ message: 'Sem histórico para análise' });

    const pse = ultimoTreino.pse || 0;
    const psr = ultimoTreino.notaRecuperacao24h || 0;

    const analiseEquipamentos = ultimoTreino.equipamentos.map((item) => {
      const pesoAnterior = item.cargaPlanejada;
      const pesoSugerido = item.cargaSugerida || pesoAnterior; // Fallback caso não tenha sido calculado

      const diff = pesoSugerido - pesoAnterior;
      // Cálculo do percentual para o badge de exibição (ex: +15%)
      const percentual =
        pesoAnterior > 0 ? ((diff / pesoAnterior) * 100).toFixed(0) : 0;

      return {
        equipamentoId: item.equipamentoId,
        nome: item.equipamento.nome,
        musculo: item.equipamento.musculoAlvo,
        cargaAnterior: pesoAnterior,
        cargaNova: pesoSugerido,
        ajusteTexto: `${diff > 0 ? '+' : ''}${percentual}%`,
      };
    });

    let recomendacao = 'Manter carga atual';

    // Lógica de Progressão (IA/QA)
    // 0-4: Muito Leve a Leve / PSR 8-10: Muito Recuperado
    if (pse <= 4 && psr >= 8) {
      recomendacao = 'Aumentar carga para progressão';
    }
    // 9-10: Muito Forte / PSR 0-4: Pouco Recuperado
    else if (pse >= 9 && psr <= 4) {
      recomendacao = 'Reduzir carga para evitar lesão';
    }
    // 7-8: Forte / PSR 7-10: Recuperado
    else if (pse >= 7 && psr >= 7) {
      recomendacao = 'Ajuste fino: leve aumento';
    }

    res.json({
      alunoId,
      dataAnalise: ultimoTreino.dataFeedback,
      pseInformada: pse,
      psrInformada: psr,
      recomendacao,
      detalhes: analiseEquipamentos,
    });
  } catch (error) {
    console.error('Erro na sugestão IA:', error);
    res.status(500).json({ error: 'Erro ao processar sugestão' });
  }
});
// ---

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GymFlow API rodando em http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
