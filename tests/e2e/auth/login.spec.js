import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('POST /login - Deve autenticar usuário com credenciais válidas', async ({
    request,
  }) => {
    console.log('BASE_URL:', process.env.BASE_URL);
    const response = await request.post(process.env.BASE_URL + '/login', {
      data: { email: 'aluna@gym.com', senha: '123' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('token');
    expect(body.email).toBe('aluna@gym.com');
    expect(body.role).toBe('ALUNO');
  });

  test('POST /login - Deve retornar erro para senha inválida', async ({
    request,
  }) => {
    const response = await request.post(process.env.BASE_URL + '/login', {
      data: { email: 'aluna@gym.com', senha: 'errada' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('E-mail ou senha incorretos');
  });

  test('POST /login - Deve retornar erro para usuário inexistente', async ({
    request,
  }) => {
    const response = await request.post(process.env.BASE_URL + '/login', {
      data: { email: 'nao-existe@gym.com', senha: '123' },
    });
    expect(response.status()).toBe(401);
  });
});
