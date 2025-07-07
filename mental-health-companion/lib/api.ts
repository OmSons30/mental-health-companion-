const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  email: string;
  full_name: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreate {
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category?: string;
  description?: string;
  date?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Authentication methods
  async signup(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    
    // Handle Supabase session structure
    if (data.session) {
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
    }
    
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    
    // Handle Supabase session structure
    if (data.session) {
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('refresh_token', data.session.refresh_token);
    }
    
    return data;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    return data.user;
  }

  // Transaction methods
  async createTransaction(transaction: TransactionCreate): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create transaction');
    }

    const data = await response.json();
    return data.transaction;
  }

  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ transactions: Transaction[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/transactions?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch transactions');
    }

    return await response.json();
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch transaction');
    }

    const data = await response.json();
    return data.transaction;
  }

  async updateTransaction(id: string, transaction: Partial<TransactionCreate>): Promise<Transaction> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(transaction),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update transaction');
    }

    const data = await response.json();
    return data.transaction;
  }

  async deleteTransaction(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete transaction');
    }
  }

  async getTransactionSummary(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/transactions/summary?${searchParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch transaction summary');
    }

    return await response.json();
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const apiService = new ApiService(); 