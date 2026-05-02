import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';

test.describe('Equipamentos', () => {
  test('POST /equipamentos - Professor deve cadastrar equipamento com sucesso', async ({
    request,
  }) => {
    const token = await getToken(request, 'professor');

    const response = await request.post('/equipamentos', {
      headers: { Authorization: token },
      data: {
        nome: 'Leg Press',
        musculoAlvo: 'Perna',
        url: 'https://exemplo.com/leg.png',
      },
    });

    expect(response.status()).toBe(201);
  });

  test('POST /equipamentos - Aluno não deve cadastrar equipamento', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    const response = await request.post('/equipamentos', {
      headers: { Authorization: token },
      data: {
        nome: 'Cadeira extensora',
        musculoAlvo: 'Quadríceps',
        url: 'https://exemplo.com/extensora.png',
      },
    });

    expect(response.status()).toBe(403);
  });
});
