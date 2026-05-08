// ─── API Service Layer ────────────────────────────────────────────────────────
// Tất cả HTTP calls đến backend đi qua đây.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
  role: 'user' | 'admin';
  avatar_url?: string;
}

export interface LoginResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export interface Ingredient {
  ten_nguyen_lieu: string;
  so_luong: number;
  don_vi: string;
}

export interface RecognizeResponse {
  success: boolean;
  ingredients: Ingredient[];
  count: number;
  message?: string;
}

export interface ScanSessionResponse {
  success: boolean;
  session_id?: number;
  created_at?: string;
  message?: string;
}

export interface ScanSession {
  id: number;
  status: string;
  ingredient_list: Ingredient[];
  recipes_result?: unknown;
  video_results?: unknown;
  dish_name?: string;
  created_at: string;
  updated_at: string;
}

// ─── Token Storage ────────────────────────────────────────────────────────────

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const tokenStorage = {
  getAccessToken: () => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null),
  getRefreshToken: () => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    // Lưu vào cookie để middleware đọc được (route guard)
    document.cookie = `access_token=${access}; path=/; max-age=3600; SameSite=Lax`;
  },
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    // Xóa cookie
    document.cookie = 'access_token=; path=/; max-age=0';
  },
};

// ─── Base Fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  withAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Không set Content-Type cho FormData (browser tự set boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (withAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Nếu 401 và có refresh token, thử refresh rồi retry
  if (res.status === 401 && withAuth) {
    const refreshed = await authApi.refresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${tokenStorage.getAccessToken()}`;
      const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers });
      return safeJson(retryRes);
    }
    tokenStorage.clearTokens();
    throw new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
  }

  return safeJson(res);
}

// Parse JSON an toàn — nếu response không phải JSON thì throw lỗi rõ ràng
async function safeJson<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    console.error('[apiFetch] Non-JSON response:', res.status, text.substring(0, 200));
    throw new Error(`Lỗi kết nối đến server (${res.status})`);
  }
  return res.json();
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  async register(email: string, password: string, display_name: string): Promise<RegisterResponse> {
    return apiFetch<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name }),
    });
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async refresh(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const data = await apiFetch<{ success: boolean; access_token?: string }>(
        '/auth/refresh',
        {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );
      if (data.success && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } finally {
      tokenStorage.clearTokens();
    }
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const data = await apiFetch<{ success: boolean; user: AuthUser }>('/auth/me', {}, true);
      return data.success ? data.user : null;
    } catch {
      return null;
    }
  },
};

// ─── Ingredient API ───────────────────────────────────────────────────────────

export const ingredientApi = {
  async recognize(files: File[]): Promise<RecognizeResponse> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    return apiFetch<RecognizeResponse>(
      '/ingredients/recognize',
      { method: 'POST', body: formData },
      true
    );
  },
};

// ─── Recipe API ───────────────────────────────────────────────

export interface SuggestedRecipe {
  id: number;
  name: string;
  cook_time: string;
  difficulty: string;
  matchPercentage: number;
  missingIngredients: string[];
  ingredients: Ingredient[];
  steps: { buoc: number; mo_ta: string }[];
  image_url?: string;
}

export interface SuggestResponse {
  success: boolean;
  recipes: SuggestedRecipe[];
  total: number;
  note?: string;
}

export interface RecipeListResponse {
  success: boolean;
  recipes: {
    id: number;
    name: string;
    cook_time: string;
    difficulty: string;
    ingredients_text: string;
    created_at: string;
  }[];
  pagination: { page: number; limit: number; total: number; total_pages: number };
}

export const recipeApi = {
  /**
   * Gợi ý công thức dựa trên danh sách nguyên liệu (Req 3)
   * @param ingredients Mảng tên nguyên liệu
   * @param limit Số kết quả tối đa (default 12)
   */
  async suggest(ingredients: string[], limit = 12): Promise<SuggestResponse> {
    const query = ingredients.map((i) => encodeURIComponent(i)).join(',');
    return apiFetch<SuggestResponse>(
      `/recipes/suggest?ingredients=${query}&limit=${limit}`,
      {},
      true
    );
  },

  /**
   * Lấy danh sách công thức có phân trang
   */
  async list(page = 1, limit = 12, search = ''): Promise<RecipeListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
    });
    return apiFetch<RecipeListResponse>(`/recipes?${params}`);
  },

  /**
   * Lấy chi tiết một công thức
   */
  async getById(id: number): Promise<{ success: boolean; recipe: SuggestedRecipe }> {
    return apiFetch(`/recipes/${id}`);
  },
};

// ─── Scan Session API ─────────────────────────────────────────────────────────

export const scanSessionApi = {
  /**
   * Lưu scan session sau khi người dùng chốt danh sách (Req 2.9)
   */
  async save(ingredientList: Ingredient[]): Promise<ScanSessionResponse> {
    return apiFetch<ScanSessionResponse>(
      '/ingredients/sessions',
      {
        method: 'POST',
        body: JSON.stringify({ ingredient_list: ingredientList }),
      },
      true
    );
  },

  /**
   * Lấy lịch sử scan sessions (Req 5.2)
   */
  async getHistory(page = 1, limit = 10): Promise<{
    success: boolean;
    sessions: ScanSession[];
    pagination: { page: number; limit: number; total: number; total_pages: number };
  }> {
    return apiFetch(
      `/ingredients/sessions?page=${page}&limit=${limit}`,
      {},
      true
    );
  },

  /**
   * Lấy chi tiết một scan session (Req 5.3)
   */
  async getById(sessionId: number): Promise<{ success: boolean; session: ScanSession }> {
    return apiFetch(`/ingredients/sessions/${sessionId}`, {}, true);
  },
};
