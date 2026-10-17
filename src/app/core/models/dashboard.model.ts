import { ClaimStatus } from './claim.model';

export interface ClaimsByStatus {
  status: ClaimStatus;
  count: number;
}

export interface OfficerWorkloadSummary {
  officerId: string;
  officerName: string;
  activeCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalHandled: number;
}

export interface DashboardSummary {
  totalOpenClaims: number;
  outstandingLiability: number;
  claimsByStatus: ClaimsByStatus[];
  officerWorkloads: OfficerWorkloadSummary[];
}
