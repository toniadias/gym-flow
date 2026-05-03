import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';

test.describe('Usuários', () => {
  test('POST /usuarios - Deve criar usuário com role aluno com sucesso', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    const response = await request.post('/usuarios', {
      headers: { Authorization: token },
      data: {
        nome: 'Teste Automatizado Aluno',
        email: `teste-aluno${Date.now()}@email.com`,
        senha: '123456',
        role: 'ALUNO',
      },
    });

    expect(response.status()).toBe(201);
  });

  test('POST /usuarios - Deve criar usuário com role professor com sucesso', async ({
    request,
  }) => {
    const token = await getToken(request, 'professor');

    const response = await request.post('/usuarios', {
      headers: { Authorization: token },
      data: {
        nome: 'Teste Automatizado Professor',
        email: `teste-professor${Date.now()}@email.com`,
        senha: '123456',
        role: 'PROFESSOR',
      },
    });

    expect(response.status()).toBe(201);
  });
});
