import { test, expect } from '@playwright/test';
import { getToken, loginAs } from '../../utils/auth.helper';

test.describe('Autenticação e RBAC', () => {
  test('GET /usuarios sem token retorna 401', async ({ request }) => {
    const response = await request.get('/usuarios');

    expect(response.status()).toBe(401);
  });

  test('GET /usuarios com token inválido retorna 401', async ({ request }) => {
    const response = await request.get('/usuarios', {
      headers: { Authorization: 'Bearer token-invalido' },
    });

    expect(response.status()).toBe(401);
  });

  test('GET /equipamentos com aluno retorna 403', async ({ request }) => {
    const token = await getToken(request, 'aluna');

    const response = await request.get('/equipamentos', {
      headers: { Authorization: token },
    });

    expect(response.status()).toBe(403);
  });

  test('GET /sugerir-carga/:alunoId com aluno retorna 403', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    const response = await request.get('/sugerir-carga/1', {
      headers: { Authorization: token },
    });

    expect(response.status()).toBe(403);
  });

  test('GET /relatorios/performance com aluno retorna 403', async ({
    request,
  }) => {
    const token = await getToken(request, 'aluna');

    const response = await request.get('/relatorios/performance?usuarioId=1', {
      headers: { Authorization: token },
    });

    expect(response.status()).toBe(403);
  });

  test('POST /treinos sem equipamentosSelecionados retorna 400', async ({
    request,
  }) => {
    const alunoLogin = await loginAs(request, 'aluna');
    //Precisa de permissao para criar treino
    const professor = await loginAs(request, 'professor');

    const response = await request.post('/treinos', {
      headers: { Authorization: professor.token },
      data: {
        usuarioId: alunoLogin.id,
        exercise: 'Treino sem equipamentos',
        acao: 'AJUSTAR',
        equipamentosSelecionados: [],
      },
    });

    expect(response.status()).toBe(400);
  });
});
