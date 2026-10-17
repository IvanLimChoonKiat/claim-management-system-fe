import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    @if (auth.isAuthenticated()) {
      <nav>
        <div class="brand">Chubb Claims</div>
        @if (auth.hasRole('Claimant')) {
          <a routerLink="/claimant/my-claims">My Claims</a>
          <a routerLink="/claimant/submit">Report Incident</a>
        } @else {
          <a routerLink="/officer/queue">Unassigned Queue</a>
          <a routerLink="/officer/workload">My Workload</a>
        }
        <span class="spacer"></span>
        <span class="user-chip">{{ auth.currentUser()?.displayName }} ({{ auth.currentUser()?.role }})</span>
        <button (click)="logout()">Sign out</button>
      </nav>
    }
    <main>
      <router-outlet />
    </main>
  `,
  styles: [
    `
      nav {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        padding: 0.75rem 1.5rem;
        background: #111827;
        color: #fff;
      }
      nav a {
        color: #e5e7eb;
        text-decoration: none;
        font-weight: 600;
      }
      nav a:hover {
        color: #fff;
      }
      .brand {
        font-weight: 700;
      }
      .spacer {
        flex: 1;
      }
      .user-chip {
        font-size: 0.85rem;
        color: #9ca3af;
      }
      nav button {
        background: transparent;
        border: 1px solid #4b5563;
        color: #fff;
        padding: 0.3rem 0.75rem;
        border-radius: 0.375rem;
        cursor: pointer;
      }
      main {
        max-width: 960px;
        margin: 2rem auto;
        padding: 0 1.5rem;
      }
    `
  ]
})
export class AppComponent {
  constructor(
    readonly auth: AuthService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
