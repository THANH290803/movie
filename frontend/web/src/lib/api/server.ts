import 'server-only'

const baseUrl = (process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '')

export class ApiServerError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export async function serverApi<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}/api/v1${path}`, { cache: 'no-store' })
  } catch {
    throw new ApiServerError(503, 'Không thể kết nối đến API. Hãy kiểm tra backend.')
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string } | null
    throw new ApiServerError(response.status, body?.message ?? `API trả mã ${response.status}`)
  }
  return response.json() as Promise<T>
}
