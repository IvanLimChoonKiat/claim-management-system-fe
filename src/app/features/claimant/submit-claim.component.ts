import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimsApiService } from '../../core/services/claims-api.service';

@Component({
  selector: 'app-submit-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h1>Report an Incident</h1>

    <form [formGroup]="form" (ngSubmit)="submit()">
      <label>
        Claim type
        <select formControlName="type">
          <option value="Motor">Motor</option>
          <option value="Property">Property</option>
        </select>
      </label>

      <label>
        Incident date
        <input type="date" formControlName="incidentDate" [max]="today" />
      </label>

      @if (form.value.type === 'Motor') {
        <label>
          Vehicle registration
          <input type="text" formControlName="vehicleRegistration" placeholder="e.g. SGX1234A" />
        </label>
      } @else {
        <label>
          Property address
          <input type="text" formControlName="propertyAddress" placeholder="123 Main St" />
        </label>
      }

      <label>
        Incident location
        <input type="text" formControlName="incidentLocation" placeholder="Where did it happen?" />
      </label>

      <label>
        Description
        <textarea formControlName="incidentDescription" rows="4" placeholder="What happened?"></textarea>
      </label>

      <label>
        Estimated liability (optional)
        <input type="number" formControlName="estimatedLiability" min="0" step="0.01" />
      </label>

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }

      <button type="submit" [disabled]="form.invalid || submitting()">
        {{ submitting() ? 'Submitting...' : 'Submit claim' }}
      </button>
    </form>
  `,
  styles: [
    `
      form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 480px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.9rem;
        font-weight: 600;
      }
      input,
      select,
      textarea {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font: inherit;
      }
      button {
        margin-top: 0.5rem;
        padding: 0.6rem;
        background: #1d4ed8;
        color: #fff;
        border: none;
        border-radius: 0.375rem;
        cursor: pointer;
        font-weight: 600;
        align-self: flex-start;
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
export class SubmitClaimComponent {
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly today = new Date().toISOString().slice(0, 10);

  // inject() rather than constructor-parameter FormBuilder: field initializers run before the
  // constructor body assigns constructor-parameter properties.
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    type: ['Motor', Validators.required],
    incidentDate: [this.today, Validators.required],
    incidentLocation: ['', Validators.required],
    incidentDescription: ['', Validators.required],
    vehicleRegistration: [''],
    propertyAddress: [''],
    estimatedLiability: [null as number | null]
  });

  constructor(
    private readonly claimsApi: ClaimsApiService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    this.claimsApi
      .submitClaim({
        type: value.type as 'Motor' | 'Property',
        incidentDateUtc: new Date(value.incidentDate!).toISOString(),
        incidentDescription: value.incidentDescription!,
        incidentLocation: value.incidentLocation!,
        vehicleRegistration: value.type === 'Motor' ? value.vehicleRegistration : null,
        propertyAddress: value.type === 'Property' ? value.propertyAddress : null,
        estimatedLiability: value.estimatedLiability
      })
      .subscribe({
        next: (claim) => {
          this.submitting.set(false);
          this.router.navigate(['/claimant/claims', claim.id]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.detail ?? 'Failed to submit claim.');
        }
      });
  }
}
