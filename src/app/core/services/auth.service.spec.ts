import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../api-config';
import { DevLoginResponse } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const sampleResponse: DevLoginResponse = {
    token: 'fake-jwt',
    user: { id: 'u1', email: 'alice@example.com', displayName: 'Alice', role: 'Claimant' }
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts unauthenticated with no stored session', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('stores the session and marks the user authenticated after a successful login', () => {
    service.login({ email: 'alice@example.com', displayName: 'Alice', role: 'Claimant' }).subscribe();

    const req = httpMock.expectOne(`${API_BASE_URL}/auth/dev-login`);
    expect(req.request.method).toBe('POST');
    req.flush(sampleResponse);

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()?.email).toBe('alice@example.com');
    expect(service.token()).toBe('fake-jwt');
    expect(service.hasRole('Claimant')).toBeTrue();
    expect(service.hasRole('ClaimsOfficer')).toBeFalse();
  });

  it('persists the session across a fresh service instance (survives a page refresh)', () => {
    service.login({ email: 'alice@example.com', displayName: 'Alice', role: 'Claimant' }).subscribe();
    httpMock.expectOne(`${API_BASE_URL}/auth/dev-login`).flush(sampleResponse);

    // AuthService is providedIn: 'root', so re-injecting in the same TestBed returns the same
    // instance; construct a second one explicitly to simulate a true app reload reading localStorage.
    const reloaded = new AuthService(TestBed.inject(HttpClient));
    expect(reloaded.isAuthenticated()).toBeTrue();
    expect(reloaded.currentUser()?.email).toBe('alice@example.com');
  });

  it('clears the session on logout', () => {
    service.login({ email: 'alice@example.com', displayName: 'Alice', role: 'Claimant' }).subscribe();
    httpMock.expectOne(`${API_BASE_URL}/auth/dev-login`).flush(sampleResponse);

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('claims-auth')).toBeNull();
  });
});
