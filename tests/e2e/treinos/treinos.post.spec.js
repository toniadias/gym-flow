import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';
import {
  getUserIdByRole,
  getEquipamentosParaTreino,
  getAlunoComTreino,
} from '../../utils/global';

test.describe('Treinos', () => {
  test('POST /treinos - Deve criar treino com sucesso', async ({ request }) => {
    const token = await getToken(request, 'professor');

    const alunoId = await getAlunoComTreino(request, token);
    const equipamentosSelecionados = await getEquipamentosParaTreino(
      request,
      token,
    );

    const response = await request.post('/treinos', {
      headers: { Authorization: token },
      data: {
        usuarioId: alunoId,
        exercise: 'Treino A',
        prescribed_intensity: 'Moderada',
        acao: 'CRIAR',
        equipamentosSelecionados,
      },
    });

    expect(response.status()).toBe(201);
  });

  test('POST /treinos - Deve falhar sem equipamento', async ({ request }) => {
    const token = await getToken(request, 'professor');

    const alunoId = await getAlunoComTreino(request, token);

    const response = await request.post('/treinos', {
      headers: { Authorization: token },
      data: {
        usuarioId: alunoId,
        exercise: 'Treino Sem Equipamento',
        prescribed_intensity: 'Moderada',
        acao: 'CRIAR',
        equipamentosSelecionados: [],
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Selecione ao menos um equipamento com carga.');
  });
});
