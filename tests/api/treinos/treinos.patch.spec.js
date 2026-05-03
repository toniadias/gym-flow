import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';
import { getTreinoId, getAlunoComTreino } from '../../utils/global';

test.describe('Treinos', () => {
  test('PATCH /treinos/:id/iniciar - Deve iniciar treino com sucesso', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');
    const treinoId = await getTreinoId(request, token);

    const response = await request.patch(`/treinos/${treinoId}/iniciar`, {
      headers: { Authorization: token },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('EM_ANDAMENTO');
  });

  test('PATCH /treinos/:id/iniciar - Deve retornar erro treino não localizado', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    const treinoIdInvalido = '00000000-0000-0000-0000-000000000000';

    const response = await request.patch(
      `/treinos/${treinoIdInvalido}/iniciar`,
      {
        headers: { Authorization: token },
      },
    );

    expect(response.status()).toBe(404);

    const body = await response.json();

    expect(body.error).toBe('Treino não localizado');
  });
});
