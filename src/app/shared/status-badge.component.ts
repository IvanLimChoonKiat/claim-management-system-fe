import { Component, Input } from '@angular/core';
import { ClaimStatus } from '../core/models/claim.model';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="status-badge" [class]="'status-' + status.toLowerCase()">{{ status }}</span>`,
  styles: [
    `
      .status-badge {
        display: inline-block;
        padding: 0.15rem 0.6rem;
        border-radius: 1rem;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
      }
      .status-submitted { background: #6b7280; }
      .status-assigned { background: #2563eb; }
      .status-inforequested { background: #d97706; }
      .status-approved { background: #16a34a; }
      .status-rejected { background: #dc2626; }
    `
  ]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: ClaimStatus;
}
