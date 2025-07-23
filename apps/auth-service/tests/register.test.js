const assert = require('assert');
const axios = require('axios');

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await axios.post('http://localhost:3001/api/auth/register', {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Password123!',
    });

    assert.strictEqual(response.status, 201);
    assert.strictEqual(response.data.message, 'Usuario registrado exitosamente. Por favor, revisa tu correo para verificar tu cuenta.');
  });
});
