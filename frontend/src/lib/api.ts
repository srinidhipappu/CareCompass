const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw json || { success: false, error: 'Network error' };
  return json;
}

// Auth
export const register = (payload: { name: string; email: string; password: string }) =>
  request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const login = (payload: { email: string; password: string }) =>
  request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });

// Hospitals
export const listHospitals = (query = '') => request(`/api/hospitals${query ? `?${query}` : ''}`);
export const getHospital = (id: string) => request(`/api/hospitals/${id}`);
export const listHospitalsNearby = (lat: number, lng: number, radiusKm = 50, page = 1, limit = 20) =>
  request(`/api/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radiusKm}&page=${page}&limit=${limit}`);

// Doctors
export const listDoctors = (query = '') => request(`/api/doctors${query ? `?${query}` : ''}`);
export const getDoctor = (id: string) => request(`/api/doctors/${id}`);

// Appointments
export const createAppointment = (payload: any) => request('/api/appointments', { method: 'POST', body: JSON.stringify(payload) });
export const getAppointment = (id: string) => request(`/api/appointments/${id}`);
export const getUserAppointments = (userId: string) => request(`/api/appointments/user/${userId}`);
export const deleteAppointment = (id: string) => request(`/api/appointments/${id}`, { method: 'DELETE' });

// AI
export const analyzeSymptoms = (payload: { userId?: string; symptomsText: string; lat?: number; lng?: number }) =>
  request('/api/ai/analyze', { method: 'POST', body: JSON.stringify(payload) });

// Admin (requires admin secret header) — pass headers as third arg
export const seedDB = (adminSecret: string) =>
  fetch(`${BASE}/api/admin/seed`, { method: 'POST', headers: { 'x-admin-secret': adminSecret } }).then((r) => r.json());

export default { register, login, listHospitals, getHospital, listHospitalsNearby, listDoctors, getDoctor, createAppointment, getAppointment, getUserAppointments, deleteAppointment, analyzeSymptoms, seedDB };
