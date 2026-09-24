// client/src/lib/api.ts
const BASE_URL = '/api/v1';

export function getStoredToken(): string {
  return localStorage.getItem('campuseco_token') || 'dev-admin-token';
}

export function setStoredToken(token: string): void {
  localStorage.setItem('campuseco_token', token);
}

export function clearStoredToken(): void {
  localStorage.removeItem('campuseco_token');
}

export function getStoredUser() {
  const user = localStorage.getItem('campuseco_user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@campus-eco.edu',
    full_name: 'Dr. Evelyn Vance',
    role: 'admin',
    department: 'Campus Sustainability Office',
  };
}

export function setStoredUser(user: any): void {
  localStorage.setItem('campuseco_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    const message = errorData.message || errorData.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth & Roles
  demoLogin: (role: 'admin' | 'staff' | 'student') =>
    request<{ message: string; token: string; user: any }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
  getUsers: () => request<{ users: any[] }>('/auth/users'),
  updateUserRole: (userId: string, role: string) =>
    request<{ message: string; profile: any }>(`/auth/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  // Telemetry & Alerts
  getTelemetryOverview: () => request<any>('/telemetry/overview'),
  resolveAlert: (alertId: string) =>
    request<any>(`/telemetry/resolve-alert/${alertId}`, { method: 'POST' }),

  // 1. Dustbins
  getDustbins: (params?: { zone?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.zone) query.append('zone', params.zone);
    if (params?.status) query.append('status', params.status);
    return request<any>(`/dustbins?${query.toString()}`);
  },
  submitDustbinTelemetry: (data: { bin_code: string; zone_name: string; fill_level: number; battery_level: number }) =>
    request<any>('/dustbins/telemetry', { method: 'POST', body: JSON.stringify(data) }),
  cleanDustbin: (binCode: string) =>
    request<any>(`/dustbins/${binCode}/clean`, { method: 'POST' }),
  getDustbinRoutePlan: () => request<any>('/dustbins/route-plan'),

  // 2. Food Waste
  getFoodWasteLogs: () => request<any>('/food-waste'),
  logFoodWaste: (data: any) =>
    request<any>('/food-waste/log', { method: 'POST', body: JSON.stringify(data) }),
  predictFoodPrep: (data: any) =>
    request<any>('/food-waste/predict', { method: 'POST', body: JSON.stringify(data) }),

  // 3. Water Leak Detector
  getWaterSensors: () => request<any>('/water/sensors'),
  submitWaterTelemetry: (data: any) =>
    request<any>('/water/telemetry', { method: 'POST', body: JSON.stringify(data) }),
  analyzeWaterLeak: (data: any) =>
    request<any>('/water/analyze', { method: 'POST', body: JSON.stringify(data) }),
  updateWaterValve: (sensorCode: string, action: 'OPEN' | 'THROTTLED' | 'ISOLATED') =>
    request<any>(`/water/valve/${sensorCode}`, { method: 'POST', body: JSON.stringify({ action }) }),

  // 4. Energy Monitoring
  getEnergyBuildings: () => request<any>('/energy/buildings'),
  logEnergy: (data: any) =>
    request<any>('/energy/log', { method: 'POST', body: JSON.stringify(data) }),
  optimizeEnergy: (data: any) =>
    request<any>('/energy/optimize', { method: 'POST', body: JSON.stringify(data) }),

  // 5. Plastic Rewards Hub
  getStudentBalance: (studentId: string) => request<any>(`/rewards/balance/${studentId}`),
  getRewardsCatalog: () => request<any>('/rewards/catalog'),
  getLeaderboard: () => request<any>('/rewards/leaderboard'),
  depositPlastic: (data: { student_id: string; bottle_count: number; weight_grams?: number; recycling_type?: string }) =>
    request<any>('/rewards/deposit', { method: 'POST', body: JSON.stringify(data) }),
  redeemReward: (data: { student_id: string; reward_id: string; points_required: number; item_name: string }) =>
    request<any>('/rewards/redeem', { method: 'POST', body: JSON.stringify(data) }),

  // 6. Rainwater Harvesting
  getRainwaterStatus: () => request<any>('/rainwater/status'),
  submitRainwaterTelemetry: (data: any) =>
    request<any>('/rainwater/telemetry', { method: 'POST', body: JSON.stringify(data) }),
  forecastRainwater: (data: any) =>
    request<any>('/rainwater/forecast', { method: 'POST', body: JSON.stringify(data) }),

  // 7. Air Quality Monitoring (AQI)
  getAirQualityZones: () => request<any>('/air-quality/zones'),
  submitAirQualityTelemetry: (data: any) =>
    request<any>('/air-quality/telemetry', { method: 'POST', body: JSON.stringify(data) }),

  // Master AI Advisory
  getMasterAdvisory: (data: any) =>
    request<any>('/ai/master-advisory', { method: 'POST', body: JSON.stringify(data) }),
  getAutoSynthesize: () => request<any>('/ai/auto-synthesize'),
};
