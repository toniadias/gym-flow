async function getAuthToken(request) {
  const response = await request.post('/login', {
    data: { email: 'aluna@gym.com', senha: '123' },
  });
  const body = await response.json();
  return body.token; // Retorna "Bearer ..."
}
module.exports = { getAuthToken };
