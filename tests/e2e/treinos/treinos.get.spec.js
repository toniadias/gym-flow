import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';
import { getUserIdByRole, getAlunoComTreino } from '../../utils/global';

test.describe('Treinos', () => {
  test('GET /treinos - Deve garantir aluno com treino', async ({ request }) => {
    const token = await getToken(request, 'aluna');
    const alunoId = await getAlunoComTreino(request, token);

    const response = await request.get(`/treinos?usuarioId=${alunoId}`, {
      headers: { Authorization: token },
    });

    expect(response.status()).toBe(200);
    const treinos = await response.json();
    expect(treinos.length).toBeGreaterThan(0);
  });
});
