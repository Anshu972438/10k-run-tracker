async function handleResponse(response) {
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message ?? 'Something went wrong. Please try again.')
  }
  return response.status === 204 ? null : response.json()
}

export async function getRuns() {
  return handleResponse(await fetch('/api/runs'))
}

export async function getSummary() {
  return handleResponse(await fetch('/api/runs/summary'))
}

export async function createRun(run) {
  const response = await fetch('/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(run),
  })
  return handleResponse(response)
}

export async function deleteRun(id) {
  return handleResponse(await fetch(`/api/runs/${id}`, { method: 'DELETE' }))
}
