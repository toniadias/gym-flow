import { test, expect } from '@playwright/test';
import { getToken } from '../../utils/auth.helper';

test.describe('Usuários', () => {
  test('GET /usuarios - Deve retornar lista de usuários com sucesso', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    const response = await request.get('/usuarios', {
      headers: { Authorization: token },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });
});
