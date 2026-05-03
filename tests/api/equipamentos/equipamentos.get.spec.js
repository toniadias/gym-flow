import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';

test.describe('Equipamentos', () => {
  test('GET /equipamentos - Professor deve acessar lista de equipamentos com sucesso', async ({
    request,
  }) => {
    const token = await getToken(request, 'professor');

    const response = await request.get('/equipamentos', {
      headers: {
        Authorization: token,
      },
    });

    expect(response.status()).toBe(200);
  });

  test('GET /equipamentos - Aluno não deve acessar lista de equipamentos', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    const response = await request.get('/equipamentos', {
      headers: { Authorization: token },
    });

    expect(response.status()).toBe(403);
  });
});
