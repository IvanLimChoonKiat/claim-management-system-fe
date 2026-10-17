import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-card">
      <h1>Chubb Claims Management</h1>
      <p class="warning">
        Dev-only mock login - enter any email and a display name, pick a role. There is no
        password; this is not production authentication.
      </p>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <label>
          Email
          <input type="email" formControlName="email" placeholder="you@example.com" />
        </label>
        <label>
          Display name
          <input type="text" formControlName="displayName" placeholder="Your name" />
        </label>
        <label>
          Role
          <select formControlName="role">
            <option value="Claimant">Claimant</option>
            <option value="ClaimsOfficer">Claims Officer</option>
          </select>
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .login-card {
        max-width: 420px;
        margin: 4rem auto;
        padding: 2rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
      }
      .warning {
        font-size: 0.85rem;
        color: #92400e;
        background: #fef3c7;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
      }
      form {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-top: 1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.9rem;
        font-weight: 600;
      }
      input,
      select {
        padding: 0.5rem;
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        font-size: 1rem;
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
      }
      button:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
      .error {
        color: #dc2626;
        font-size: 0.85rem;
      }
    `
  ]
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // inject() rather than constructor-parameter FormBuilder: field initializers run before the
  // constructor body assigns constructor-parameter properties.
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    displayName: ['', Validators.required],
    role: ['Claimant', Validators.required]
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();
    this.auth
      .login({
        email: value.email!,
        displayName: value.displayName!,
        role: value.role as 'Claimant' | 'ClaimsOfficer'
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          const landing = response.user.role === 'Claimant' ? '/claimant/my-claims' : '/officer/queue';
          this.router.navigateByUrl(landing);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('Sign-in failed. Is the backend running at http://localhost:5299?');
        }
      });
  }
}
