import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ClaimsApiService } from '../../core/services/claims-api.service';
import { ClaimSummary } from '../../core/models/claim.model';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-officer-queue',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <h1>Unassigned Claims</h1>

    @if (loading()) {
      <p>Loading...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (claims().length === 0) {
      <p>No unassigned claims right now.</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Status</th>
            <th>Submitted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (claim of claims(); track claim.id) {
            <tr>
              <td><a [routerLink]="['/officer/claims', claim.id]">{{ claim.claimReference }}</a></td>
              <td>{{ claim.type }}</td>
              <td><app-status-badge [status]="claim.status" /></td>
              <td>{{ claim.createdAtUtc | date: 'medium' }}</td>
              <td>
                <button (click)="assign(claim.id)" [disabled]="assigning() === claim.id">
                  {{ assigning() === claim.id ? 'Assigning...' : 'Assign to me' }}
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: [
    `
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
      }
      th,
      td {
        text-align: left;
        padding: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
      }
      button {
        padding: 0.4rem 0.8rem;
        background: #1d4ed8;
        color: #fff;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
      }
      button:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      .error {
        color: #dc2626;
      }
    `
  ]
})
export class OfficerQueueComponent implements OnInit {
  readonly claims = signal<ClaimSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly assigning = signal<string | null>(null);

  constructor(
    private readonly claimsApi: ClaimsApiService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.claimsApi.getUnassignedClaims().subscribe({
      next: (claims) => {
        this.claims.set(claims);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load the unassigned queue.');
        this.loading.set(false);
      }
    });
  }

  assign(claimId: string): void {
    this.assigning.set(claimId);
    this.claimsApi.assignClaim(claimId).subscribe({
      next: () => this.router.navigate(['/officer/claims', claimId]),
      error: () => {
        this.assigning.set(null);
        this.error.set('Failed to assign claim - someone may have just picked it up.');
        this.load();
      }
    });
  }
}
