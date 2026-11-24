import { User } from "@/models/user";

export async function getUser(): Promise<User> {
  const response = await fetch(`/api/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar dados');
  }
  const data = await response.json();
  return data.user;
}