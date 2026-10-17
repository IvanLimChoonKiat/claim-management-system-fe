export type ClaimType = 'Motor' | 'Property';
export type ClaimStatus = 'Submitted' | 'Assigned' | 'InfoRequested' | 'Approved' | 'Rejected';
export type ClaimDecisionOutcome = 'Approved' | 'Rejected';
export type InformationRequestStatus = 'Pending' | 'Responded';

export interface ClaimSummary {
  id: string;
  claimReference: string;
  type: ClaimType;
  status: ClaimStatus;
  claimantUserId: string;
  assignedOfficerUserId: string | null;
  incidentDateUtc: string;
  estimatedLiability: number | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface ClaimStatusHistoryEntry {
  fromStatus: ClaimStatus | null;
  toStatus: ClaimStatus;
  changedByUserId: string;
  changedAtUtc: string;
  note: string | null;
}

export interface InformationRequestItem {
  id: string;
  requestedByOfficerUserId: string;
  requestText: string;
  requestedAtUtc: string;
  responseText: string | null;
  respondedAtUtc: string | null;
  status: InformationRequestStatus;
}

export interface ClaimDecisionItem {
  officerUserId: string;
  outcome: ClaimDecisionOutcome;
  settlementAmount: number | null;
  reason: string;
  decidedAtUtc: string;
}

export interface ClaimDetail extends ClaimSummary {
  incidentDescription: string;
  incidentLocation: string;
  vehicleRegistration: string | null;
  propertyAddress: string | null;
  version: number;
  statusHistory: ClaimStatusHistoryEntry[];
  informationRequests: InformationRequestItem[];
  decision: ClaimDecisionItem | null;
}

export interface SubmitClaimRequest {
  type: ClaimType;
  incidentDateUtc: string;
  incidentDescription: string;
  incidentLocation: string;
  vehicleRegistration: string | null;
  propertyAddress: string | null;
  estimatedLiability: number | null;
}

export interface RequestInformationRequest {
  requestText: string;
}

export interface RespondToInformationRequest {
  responseText: string;
}

export interface DecideClaimRequest {
  outcome: ClaimDecisionOutcome;
  settlementAmount: number | null;
  reason: string;
}
