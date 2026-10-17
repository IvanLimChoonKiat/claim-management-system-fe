import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ClaimsApiService } from '../../core/services/claims-api.service';
import { ClaimSummary } from '../../core/models/claim.model';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'app-officer-workload',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
  template: `
    <h1>My Workload</h1>

    @if (loading()) {
      <p>Loading...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else if (claims().length === 0) {
      <p>You have no claims assigned to you.</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Status</th>
            <th>Estimated liability</th>
            <th>Last updated</th>
          </tr>
        </thead>
        <tbody>
          @for (claim of claims(); track claim.id) {
            <tr [routerLink]="['/officer/claims', claim.id]" class="clickable">
              <td>{{ claim.claimReference }}</td>
              <td>{{ claim.type }}</td>
              <td><app-status-badge [status]="claim.status" /></td>
              <td>{{ claim.estimatedLiability ?? '—' }}</td>
              <td>{{ claim.updatedAtUtc | date: 'medium' }}</td>
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
      .clickable {
        cursor: pointer;
      }
      .clickable:hover {
        background: #f9fafb;
      }
      .error {
        color: #dc2626;
      }
    `
  ]
})
export class OfficerWorkloadComponent implements OnInit {
  readonly claims = signal<ClaimSummary[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private readonly claimsApi: ClaimsApiService) {}

  ngOnInit(): void {
    this.claimsApi.getOfficerWorkload().subscribe({
      next: (claims) => {
        this.claims.set(claims);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load your workload.');
        this.loading.set(false);
      }
    });
  }
}
