import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Route-level convenience only - every permission here is independently and authoritatively
 * re-enforced by the backend (see claim-management-system-be CLAUDE.md "Security standards"). A
 * bug or bypass here must never be able to grant actual access to protected data.
 */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRole = route.data['role'] as UserRole | undefined;
  if (requiredRole && !auth.hasRole(requiredRole)) {
    return router.createUrlTree(['/']);
  }

  return true;
};
