import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent) },

  {
    path: 'claimant/submit',
    loadComponent: () =>
      import('./features/claimant/submit-claim.component').then((m) => m.SubmitClaimComponent),
    canActivate: [authGuard],
    data: { role: 'Claimant' }
  },
  {
    path: 'claimant/my-claims',
    loadComponent: () => import('./features/claimant/my-claims.component').then((m) => m.MyClaimsComponent),
    canActivate: [authGuard],
    data: { role: 'Claimant' }
  },
  {
    path: 'claimant/claims/:id',
    loadComponent: () => import('./features/claims/claim-detail.component').then((m) => m.ClaimDetailComponent),
    canActivate: [authGuard],
    data: { role: 'Claimant' }
  },

  {
    path: 'officer/queue',
    loadComponent: () =>
      import('./features/claims-officer/officer-queue.component').then((m) => m.OfficerQueueComponent),
    canActivate: [authGuard],
    data: { role: 'ClaimsOfficer' }
  },
  {
    path: 'officer/workload',
    loadComponent: () =>
      import('./features/claims-officer/officer-workload.component').then((m) => m.OfficerWorkloadComponent),
    canActivate: [authGuard],
    data: { role: 'ClaimsOfficer' }
  },
  {
    path: 'officer/claims/:id',
    loadComponent: () => import('./features/claims/claim-detail.component').then((m) => m.ClaimDetailComponent),
    canActivate: [authGuard],
    data: { role: 'ClaimsOfficer' }
  },

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
