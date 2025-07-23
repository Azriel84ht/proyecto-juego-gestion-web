import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import LoginPage from './LoginPage';

jest.mock('axios');

describe('LoginPage', () => {
  it('should log in a user successfully', async () => {
    axios.post.mockResolvedValue({
      data: {
        accessToken: 'test-token',
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByText(/entrar/i));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
    });
  });
});
