import type { Assignment } from '@/redux/slices/assignmentSlice';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** Normalize MongoDB documents for Redux (string _id). */
export function normalizeAssignment(raw: Record<string, unknown>): Assignment {
  const id = raw._id;
  return {
    ...(raw as unknown as Assignment),
    _id: typeof id === 'object' && id !== null && 'toString' in id
      ? String((id as { toString(): string }).toString())
      : String(id ?? ''),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error || `Request failed (${res.status})`
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchAssignments(
  search?: string,
  filter?: string
): Promise<Assignment[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (filter && filter !== 'All') params.set('filter', filter);

  const qs = params.toString();
  const res = await fetch(
    `${API_URL}/api/assignments${qs ? `?${qs}` : ''}`
  );
  const data = await handleResponse<Record<string, unknown>[]>(res);
  return data.map(normalizeAssignment);
}

export async function fetchAssignmentById(id: string): Promise<Assignment> {
  const res = await fetch(`${API_URL}/api/assignments/${id}`);
  const data = await handleResponse<Record<string, unknown>>(res);
  return normalizeAssignment(data);
}

export interface CreateAssignmentPayload {
  title: string;
  topic: string;
  gradeLevel: string;
  difficulty: string;
  dueDate: string;
  configs: {
    type: 'multiple-choice' | 'short-answer' | 'true-false';
    count: number;
    marks: number;
  }[];
  instructions?: string;
}

export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<Assignment> {
  const res = await fetch(`${API_URL}/api/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await handleResponse<Record<string, unknown>>(res);
  return normalizeAssignment(data);
}

export async function deleteAssignmentById(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/assignments/${id}`, {
    method: 'DELETE',
  });
  await handleResponse<{ success: boolean }>(res);
}
