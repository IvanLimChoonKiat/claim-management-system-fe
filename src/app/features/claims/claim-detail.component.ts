import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ClaimsApiService } from '../../core/services/claims-api.service';
import { ClaimDetail } from '../../core/models/claim.model';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

/**
 * Shared between claimant and officer routes - reads the claim once and conditionally renders
 * the claimant's "respond" form or the officer's "assign / request info / decide" actions based
 * on the logged-in user's role and the claim's current status. This is the single place that
 * answers "how does the frontend serve two user types from one codebase" (see CLAUDE.md).
 *
 * All of these conditions are UX only - the backend independently re-checks ownership/role on
 * every action, so a bug here can at worst show the wrong button, never grant real access.
 */
@Component({
  selector: 'app-claim-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgeComponent],
  template: `
    @if (loading()) {
      <p>Loading...</p>
    } @else if (error()) {
      <p class="error">{{ error() }}</p>
    } @else {
      <!-- "as" binding is only valid on a primary @if, hence nesting here rather than @else if. -->
      @if (claim(); as claim) {
      <div class="header-row">
        <h1>{{ claim.claimReference }}</h1>
        <app-status-badge [status]="claim.status" />
      </div>

      <section class="details-grid">
        <div><strong>Type</strong><br />{{ claim.type }}</div>
        <div><strong>Incident date</strong><br />{{ claim.incidentDateUtc | date: 'mediumDate' }}</div>
        <div><strong>Location</strong><br />{{ claim.incidentLocation }}</div>
        <div><strong>Estimated liability</strong><br />{{ claim.estimatedLiability ?? '—' }}</div>
        @if (claim.vehicleRegistration) {
          <div><strong>Vehicle registration</strong><br />{{ claim.vehicleRegistration }}</div>
        }
        @if (claim.propertyAddress) {
          <div><strong>Property address</strong><br />{{ claim.propertyAddress }}</div>
        }
      </section>

      <section>
        <h2>Description</h2>
        <p>{{ claim.incidentDescription }}</p>
      </section>

      @if (isOfficer() && claim.status === 'Submitted') {
        <section class="action-box">
          <button (click)="assign()" [disabled]="actionInProgress()">Assign to me</button>
        </section>
      }

      @if (isAssignedOfficer()) {
        @if (claim.status === 'Assigned') {
          <section class="action-box">
            <h2>Request additional information</h2>
            <form [formGroup]="infoForm" (ngSubmit)="requestInformation()">
              <textarea formControlName="requestText" rows="2" placeholder="What do you need from the claimant?"></textarea>
              <button type="submit" [disabled]="infoForm.invalid || actionInProgress()">Request information</button>
            </form>
          </section>

          <section class="action-box">
            <h2>Decision</h2>
            <form [formGroup]="decisionForm" (ngSubmit)="decide()">
              <label>
                Outcome
                <select formControlName="outcome">
                  <option value="Approved">Approve</option>
                  <option value="Rejected">Reject</option>
                </select>
              </label>
              @if (decisionForm.value.outcome === 'Approved') {
                <label>
                  Settlement amount
                  <input type="number" formControlName="settlementAmount" min="0.01" step="0.01" />
                </label>
              }
              <label>
                Reason
                <textarea formControlName="reason" rows="2"></textarea>
              </label>
              <button type="submit" [disabled]="decisionForm.invalid || actionInProgress()">Submit decision</button>
            </form>
          </section>
        }
      }

      @if (pendingInfoRequestForClaimant(); as pending) {
        <section class="action-box">
          <h2>Information requested</h2>
          <p>{{ pending.requestText }}</p>
          <form [formGroup]="respondForm" (ngSubmit)="respond(pending.id)">
            <textarea formControlName="responseText" rows="2" placeholder="Your response"></textarea>
            <button type="submit" [disabled]="respondForm.invalid || actionInProgress()">Send response</button>
          </form>
        </section>
      }

      @if (actionError()) {
        <p class="error">{{ actionError() }}</p>
      }

      <section>
        <h2>Status history</h2>
        <ul class="history-list">
          @for (entry of claim.statusHistory; track entry.changedAtUtc) {
            <li>
              <strong>{{ entry.fromStatus ?? 'Created' }} → {{ entry.toStatus }}</strong>
              <span class="muted"> · {{ entry.changedAtUtc | date: 'medium' }}</span>
              @if (entry.note) {
                <div class="muted">{{ entry.note }}</div>
              }
            </li>
          }
        </ul>
      </section>

      @if (claim.informationRequests.length > 0) {
        <section>
          <h2>Information requests</h2>
          @for (req of claim.informationRequests; track req.id) {
            <div class="info-request">
              <p><strong>Requested:</strong> {{ req.requestText }}</p>
              @if (req.responseText) {
                <p><strong>Response:</strong> {{ req.responseText }}</p>
              } @else {
                <p class="muted">Awaiting response</p>
              }
            </div>
          }
        </section>
      }

      @if (claim.decision; as decision) {
        <section>
          <h2>Decision</h2>
          <p>
            <app-status-badge [status]="claim.status" /> -
            {{ decision.settlementAmount ? 'Settlement: ' + decision.settlementAmount : '' }}
          </p>
          <p>{{ decision.reason }}</p>
        </section>
      }
      }
    }
  `,
  styles: [
    `
      .header-row {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
      }
      .action-box {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
        margin: 1rem 0;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 420px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.9rem;
        font-weight: 600;
      }
      textarea,
      input,
      select {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font: inherit;
      }
      button {
        align-self: flex-start;
        padding: 0.5rem 1rem;
        background: #1d4ed8;
        color: #fff;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-weight: 600;
      }
      button:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      .history-list {
        list-style: none;
        padding: 0;
      }
      .history-list li {
        padding: 0.4rem 0;
        border-bottom: 1px solid #f3f4f6;
      }
      .muted {
        color: #6b7280;
        font-size: 0.85rem;
      }
      .info-request {
        padding: 0.5rem 0;
        border-bottom: 1px solid #f3f4f6;
      }
      .error {
        color: #dc2626;
      }
    `
  ]
})
export class ClaimDetailComponent implements OnInit {
  readonly claim = signal<ClaimDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly actionInProgress = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly isOfficer = computed(() => this.auth.hasRole('ClaimsOfficer'));
  readonly isAssignedOfficer = computed(
    () => this.isOfficer() && this.claim()?.assignedOfficerUserId === this.auth.currentUser()?.id
  );
  readonly pendingInfoRequestForClaimant = computed(() => {
    const claim = this.claim();
    const user = this.auth.currentUser();
    if (!claim || !user || user.role !== 'Claimant' || claim.claimantUserId !== user.id) {
      return null;
    }
    return claim.informationRequests.find((r) => r.status === 'Pending') ?? null;
  });

  // inject() rather than constructor-parameter FormBuilder: field initializers below run before
  // the constructor body assigns constructor-parameter properties, so `this.fb` would still be
  // undefined at this point if injected that way.
  private readonly fb = inject(FormBuilder);

  readonly infoForm = this.fb.group({ requestText: ['', Validators.required] });
  readonly decisionForm = this.fb.group({
    outcome: ['Approved', Validators.required],
    settlementAmount: [null as number | null],
    reason: ['', Validators.required]
  });
  readonly respondForm = this.fb.group({ responseText: ['', Validators.required] });

  private claimId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly claimsApi: ClaimsApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.claimId = this.route.snapshot.paramMap.get('id')!;
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.claimsApi.getClaimById(this.claimId).subscribe({
      next: (claim) => {
        this.claim.set(claim);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Failed to load claim.');
        this.loading.set(false);
      }
    });
  }

  assign(): void {
    this.runAction(this.claimsApi.assignClaim(this.claimId));
  }

  requestInformation(): void {
    if (this.infoForm.invalid) return;
    this.runAction(
      this.claimsApi.requestInformation(this.claimId, { requestText: this.infoForm.value.requestText! }),
      () => this.infoForm.reset()
    );
  }

  respond(requestId: string): void {
    if (this.respondForm.invalid) return;
    this.runAction(
      this.claimsApi.respondToInformationRequest(this.claimId, requestId, {
        responseText: this.respondForm.value.responseText!
      }),
      () => this.respondForm.reset()
    );
  }

  decide(): void {
    if (this.decisionForm.invalid) return;
    const value = this.decisionForm.getRawValue();
    this.runAction(
      this.claimsApi.decide(this.claimId, {
        outcome: value.outcome as 'Approved' | 'Rejected',
        settlementAmount: value.outcome === 'Approved' ? value.settlementAmount : null,
        reason: value.reason!
      })
    );
  }

  private runAction(request: ReturnType<ClaimsApiService['assignClaim']>, onSuccess?: () => void): void {
    this.actionInProgress.set(true);
    this.actionError.set(null);
    request.subscribe({
      next: (claim) => {
        this.claim.set(claim);
        this.actionInProgress.set(false);
        onSuccess?.();
      },
      error: (err) => {
        this.actionInProgress.set(false);
        this.actionError.set(err.error?.detail ?? 'Action failed.');
      }
    });
  }
}
