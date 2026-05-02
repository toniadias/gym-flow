import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';

test.describe('Usuários', () => {
  test('PUT /usuarios/:id - Deve atualizar usuário com sucesso', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    // 1. Criar usuário
    const createResponse = await request.post('/usuarios', {
      headers: { Authorization: token },
      data: {
        nome: 'Usuário Original',
        email: `teste-${Date.now()}@email.com`,
        senha: '123456',
        role: 'ALUNO',
      },
    });

    expect(createResponse.status()).toBe(201);

    const createBody = await createResponse.json();
    const userId = createBody.id;

    // 2. Atualizar usuário criado
    const updateResponse = await request.put(`/usuarios/${userId}`, {
      headers: { Authorization: token },
      data: {
        nome: 'Usuário Atualizado',
      },
    });

    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();
    expect(updateBody.nome).toBe('Usuário Atualizado');
  });
});
