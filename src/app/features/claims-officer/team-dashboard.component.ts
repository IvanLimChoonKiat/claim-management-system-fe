import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ClaimsApiService } from '../../core/services/claims-api.service';
import { DashboardSummary } from '../../core/models/dashboard.model';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

/**
 * Team-wide operational visibility (brief: officer sees the team's workload and performance;
 * outstanding claims by status; real-time liability exposure). Open to any ClaimsOfficer - see
 * docs/ASSUMPTIONS.md for why this isn't gated behind a separate "Manager" role.
 */
@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent],
  template: `
    <h1>Team Dashboard</h1>

    @if (loading()) {
      <p>Loading...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <!-- "as" binding is only valid on a primary @if, hence nesting here rather than @else if. -->
      @if (summary(); as summary) {
      <section class="stat-row">
        <div class="stat-card">
          <div class="stat-label">Open claims</div>
          <div class="stat-value">{{ summary.totalOpenClaims }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Outstanding liability exposure</div>
          <div class="stat-value">{{ summary.outstandingLiability | number: '1.2-2' }}</div>
        </div>
      </section>

      <section>
        <h2>Claims by status</h2>
        <div class="status-row">
          @for (entry of summary.claimsByStatus; track entry.status) {
            <div class="status-chip">
              <app-status-badge [status]="entry.status" />
              <span>{{ entry.count }}</span>
            </div>
          }
        </div>
      </section>

      <section>
        <h2>Team workload &amp; performance</h2>
        @if (summary.officerWorkloads.length === 0) {
          <p>No claims have been assigned to any officer yet.</p>
        } @else {
          <table>
            <thead>
              <tr>
                <th>Officer</th>
                <th>Active</th>
                <th>Approved</th>
                <th>Rejected</th>
                <th>Total handled</th>
              </tr>
            </thead>
            <tbody>
              @for (officer of summary.officerWorkloads; track officer.officerId) {
                <tr>
                  <td>{{ officer.officerName }}</td>
                  <td>{{ officer.activeCount }}</td>
                  <td>{{ officer.approvedCount }}</td>
                  <td>{{ officer.rejectedCount }}</td>
                  <td>{{ officer.totalHandled }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
      </section>
      }
    }
  `,
  styles: [
    `
      .stat-row {
        display: flex;
        gap: 1rem;
        margin: 1rem 0 2rem;
      }
      .stat-card {
        flex: 1;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem 1.25rem;
      }
      .stat-label {
        font-size: 0.85rem;
        color: #6b7280;
      }
      .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
      }
      .status-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin: 1rem 0 2rem;
      }
      .status-chip {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        padding: 0.4rem 0.75rem;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        text-align: left;
        padding: 0.5rem;
        border-bottom: 1px solid #e5e7eb;
      }
      .error {
        color: #dc2626;
      }
    `
  ]
})
export class TeamDashboardComponent implements OnInit {
  readonly summary = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor(private readonly claimsApi: ClaimsApiService) {}

  ngOnInit(): void {
    this.claimsApi.getDashboardSummary().subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load the team dashboard.');
        this.loading.set(false);
      }
    });
  }
}
