import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import { DevLoginRequest, DevLoginResponse, User, UserRole } from '../models/user.model';

const STORAGE_KEY = 'claims-auth';

interface StoredAuth {
  token: string;
  user: User;
}

/**
 * Wraps the backend's dev-only mock login (see claim-management-system-be README "Known
 * limitations"). Token is kept in memory + localStorage purely so a page refresh doesn't log the
 * user out - this is not a production auth pattern.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly state = signal<StoredAuth | null>(this.readStoredAuth());

  readonly currentUser = computed(() => this.state()?.user ?? null);
  readonly isAuthenticated = computed(() => this.state() !== null);
  readonly token = computed(() => this.state()?.token ?? null);

  constructor(private readonly http: HttpClient) {}

  login(request: DevLoginRequest): Observable<DevLoginResponse> {
    return this.http.post<DevLoginResponse>(`${API_BASE_URL}/auth/dev-login`, request).pipe(
      tap((response) => {
        const stored: StoredAuth = { token: response.token, user: response.user };
        this.state.set(stored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      })
    );
  }

  logout(): void {
    this.state.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  private readStoredAuth(): StoredAuth | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as StoredAuth;
    } catch {
      return null;
    }
  }
}
