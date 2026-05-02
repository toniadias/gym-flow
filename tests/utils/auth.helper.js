const users = {
  professor: { email: 'profe@gym.com', senha: '123' },
  admin: { email: 'profe@gym.com', senha: '123' },
  aluna: { email: 'aluna@gym.com', senha: '123' },
};

export async function getToken(request, role) {
  const credentials =
    role === 'professor'
      ? { email: 'profe@gym.com', senha: '123' }
      : { email: 'aluna@gym.com', senha: '123' };

  const response = await request.post('/login', {
    data: credentials,
  });

  const body = await response.json();
  return body.token;
}

export async function loginAs(request, tipoUsuario = 'aluna') {
  const response = await request.post('/login', {
    data: users[tipoUsuario],
  });

  const body = await response.json();
  return body;
}
