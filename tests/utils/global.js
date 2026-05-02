import { expect } from '@playwright/test';

function getUserIdByRole(usuarios, role) {
  const user = usuarios.find((u) => u.role === role);
  return user?.id;
}

async function getAlunoComTreino(request, token) {
  const responseUsuario = await request.get('/usuarios', {
    headers: { Authorization: token },
  });

  expect(responseUsuario.status()).toBe(200);
  const usuarios = await responseUsuario.json();

  const alunos = usuarios.filter((u) => u.role === 'ALUNO');

  if (alunos.length === 0) {
    throw new Error('Nenhum usuário com role ALUNO encontrado');
  }

  for (const aluno of alunos) {
    const responseTreinos = await request.get(
      `/treinos?usuarioId=${aluno.id}`,
      {
        headers: { Authorization: token },
      },
    );

    expect(responseUsuario.status()).toBe(200);
    const treinos = await responseTreinos.json();

    if (treinos && treinos.length > 0) {
      return aluno.id;
    }
  }

  // Cria treino
  const aluno = alunos[0];
  await request.post('/treinos', {
    headers: { Authorization: token },
    data: {
      usuarioId: aluno.id,
      exercise: 'Treino automático',
      prescribed_intensity: 'Moderada',
      acao: 'CRIAR',
      equipamentosSelecionados: [{ id: 'uuid-maquina-1', carga: 50 }],
    },
  });

  return aluno.id;
}

async function getEquipamentosParaTreino(request, token) {
  const response = await request.get('/equipamentos', {
    headers: { Authorization: token },
  });

  expect(response.status()).toBe(200);
  const equipamentos = await response.json();

  if (equipamentos.length < 2) {
    throw new Error('Necessário pelo menos 2 equipamentos cadastrados');
  }

  return equipamentos.slice(0, 2).map((eq) => ({
    id: eq.id,
    carga: 50,
  }));
}

async function getTreinoId(request, token) {
  const alunoId = await getAlunoComTreino(request, token);

  const response = await request.get(`/treinos?usuarioId=${alunoId}`, {
    headers: { Authorization: token },
  });

  if (response.status() !== 200) {
    throw new Error('Erro ao buscar treino');
  }

  const treinos = await response.json();

  const treino = treinos
    .filter((t) => t.status === 'PENDENTE' && t.equipamentos?.length > 0)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  return treino?.id;
}

module.exports = {
  getUserIdByRole,
  getAlunoComTreino,
  getEquipamentosParaTreino,
  getTreinoId,
};
