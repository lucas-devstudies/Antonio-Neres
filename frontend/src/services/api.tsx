import { TaskAll, TaskBasic } from "@/models/ticket";

export async function getAllTasks(): Promise<TaskBasic[]> {
  const response = await fetch('/api/tickets', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar dados');
  }
  const data = await response.json();
  return data.tickets;
}
export async function getTaskById(id: string): Promise<TaskAll> {
  const response = await fetch(`/api/tickets/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar dados');
  }
  const data = await response.json();
  return data.ticket;
}


export async function updateTask(id:string, task: TaskAll): Promise<TaskAll> {
  const response = await fetch(`/api/tickets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error('Erro ao buscar dados');
  }
  const data = await response.json();
  return data.ticket;
}