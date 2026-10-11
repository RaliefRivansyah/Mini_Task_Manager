const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
    if (!response.ok) throw new Error((await response.json()).message || 'Request failed');
    return response.status === 204 ? null : response.json();
}

export const api = {
    getTasks: () => request('/tasks'),
    createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, data) => request(`/tasks/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
    getAuditLogs: (id) => request(`/tasks/${id}/audit-logs`),
};
