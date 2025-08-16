
interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  location?: string;
  phoneNumber?: string;
  dietaryPreferences?: string[];
  cookingExperience?: string;
  favoriteIngredients?: string;
  allergies?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  private currentUser: User | null = null;
  private token: string | null = null;
  private baseUrl = 'http://localhost:3001/api'; // Change this to your backend URL

  constructor() {
    // Load user and token from localStorage on initialization
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      this.currentUser = JSON.parse(savedUser);
      this.token = savedToken;
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();
      
      this.currentUser = data.user;
      this.token = data.token;
      
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(userInfo: {
    email: string;
    password: string;
    name: string;
    age?: number;
    location?: string;
    phoneNumber?: string;
    dietaryPreferences?: string[];
    cookingExperience?: string;
    favoriteIngredients?: string;
    allergies?: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data: LoginResponse = await response.json();
      
      // Don't auto-login after signup, let user login manually
      return data.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async updateUserProfile(updates: Partial<Omit<User, 'id' | 'email'>>): Promise<void> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    try {
      console.log('Sending profile update request with:', updates);
      
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        body: JSON.stringify(updates),
      });

      console.log('Profile update response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Profile update failed:', error);
        throw new Error(error.message || 'Profile update failed');
      }

      const updatedUser = await response.json();
      console.log('Profile updated successfully:', updatedUser);
      
      this.currentUser = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const authService = new AuthService();
