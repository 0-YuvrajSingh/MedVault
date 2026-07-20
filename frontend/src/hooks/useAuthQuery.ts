import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api/auth';
import type { LoginData, RegisterData } from '../api/auth';

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginData) => authAPI.login(data).then(r => r.data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) => authAPI.register(data).then(r => r.data),
  });
}
