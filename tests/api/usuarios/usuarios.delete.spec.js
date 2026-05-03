import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';

test.describe('Usuários', () => {
  test('DELETE /usuarios/:id - Deve remover usuário com sucesso', async ({
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

    // 2. Deletar usuário criado
    const deleteResponse = await request.put(`/usuarios/${userId}`, {
      headers: { Authorization: token },
    });

    expect(deleteResponse.status()).toBe(200);
  });
});
